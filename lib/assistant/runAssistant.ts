
// lib/assistant/runAssistant.ts
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { searchDocs } from "./tools/searchDocs";
import { getRecentMessages, saveMessage } from "@/lib/data/messages";
import { prisma } from "@/lib/db";
import { saveLead } from "./tools/saveLead";
import { tools } from "./tools/definitions";
import { saveBooking } from "./tools/saveBooking";
import { TIMEZONE } from "@/lib/config";



const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MIN_SCORE = 0.3;
const MAX_ROUNDS = 4;
const FALLBACK =
  "I don't have confirmed information about that. I'll pass your question to our team.";

// Returns the parsed object, or null if the model sent bad JSON
function parseToolArgs(raw: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(raw || "{}"); // empty string -> {}
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null; // valid JSON but not an object, e.g. null, 5, "text"
  } catch {
    return null;
  }
}







type Input = { businessId: string; sessionId: string; message: string };

export async function runAssistant({ businessId, sessionId, message }: Input) {
  // 1. Load history BEFORE saving the new message
  const history = await getRecentMessages(businessId, sessionId);
const existingLead = await prisma.lead.findUnique({
  where: { businessId_sessionId: { businessId, sessionId } },
  select: { name: true, phone: true, email: true },
});

const sessionBookings = await prisma.booking.findMany({
  where: { businessId, sessionId },
  orderBy: { createdAt: "asc" },
  select: { service: true, startTime: true, name: true, phone: true, email: true },
});
const bookingTime = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE, weekday: "short", month: "short", day: "numeric",
  hour: "numeric", minute: "2-digit",
});
const bookingList = sessionBookings
  .map((b) => `- ${b.service}, ${bookingTime.format(b.startTime)}`)
  .join("\n");
const last = sessionBookings[sessionBookings.length - 1];

  // console.log("alreadyThere",existingLead);
  

  // 3. Save the user's message
  await saveMessage({
    businessId,
    sessionId,
    role: "user",
    content: message,
  });
  // 2. Save the user's message
   
// Calculated per request in Karachi time, so it's correct on a UTC server (Vercel) too.
const now = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date());
// e.g. "Saturday, November 7, 2026 at 10:40 AM"

  
const SYSTEM_PROMPT = `You are a helpful front-desk assistant for a business.

Current date and time (Karachi): ${now}


${existingLead
  ? `IMPORTANT: A lead has already been saved for this conversation:
     - Name: ${existingLead.name}
     - Phone: ${existingLead.phone ?? "not given"}
     - Email: ${existingLead.email ?? "not given"}
     - Do not ask for the visitor's name, email, or phone again. Reuse these details, including for bookings.
     - Do not call saveLead again.
     - If another question cannot be answered, tell the visitor
       their contact information is already on file and their
       new question can be passed to the team.`
  : `Collect the visitor's name and at least one contact method
     (email or phone) when they want the team to contact them.
     Call saveLead only after collecting the required information.`}

Before answering any question about the business, call searchDocs.
Answer ONLY using what searchDocs returns. Never invent prices, hours, or policies.

${sessionBookings.length >= 3
  ? `BOOKING LIMIT REACHED. This visitor already sent the maximum of 3 booking requests in this chat:
${bookingList}
If they ask for another booking, do NOT collect details and do NOT call saveBooking.
Politely say they've reached the limit of 3 booking requests for this chat,
list the requests above, and say the team will contact them to confirm.`
  : sessionBookings.length > 0
  ? `Booking requests already sent in this chat:
${bookingList}
Contact details already given: ${last.name}, ${last.phone ?? ""} ${last.email ?? ""}.
Reuse them for new bookings; don't ask again.`
  : ""}


How to answer:
1. If the search results fully answer the question, answer it.
2. If they answer only PART of the question, share that part and say what is not listed.
3. If searchDocs returns NO_RELEVANT_INFORMATION:
   say you don't have that information, and offer to have the team contact them.
   Ask for their name and a phone number or email.

Reply format:
Your reply is shown in a small chat window (about 380px wide), rendered as simple Markdown.
- Keep replies short. Use short paragraphs of one or two sentences.
- Put prices and option names in **bold**.
- When there are 3 or more options, prices or steps, use a bullet list ("- " at the start of each line),
  one item per line, for example: "- **Full synthetic** — $89.99".
- Put details that apply to every option (for example "includes a standard filter") in one sentence
  after the list, not repeated on each line.
- Never use tables, headings (#), code blocks, or horizontal lines.
- End with at most one short follow-up question.

Saving leads:
- When the visitor gives their name and a phone number or email, call saveLead.
- In "topic", write a short summary of what they asked about.
- Never invent or guess contact details.
- If saveLead returns an ERROR, ask the visitor for the missing detail.
- After LEAD_SAVED, thank them by name and say the team will contact them.
- Offer a callback only once per conversation. If they decline, don't ask again.

Evidence requirements:
- Retrieved information must directly and explicitly answer the user's question.
- Information being related to the question is NOT enough.
- Never infer that a business offers a service just because the documents explain that service.
- Never infer eligibility, age limits, availability, prices, or policies.
- If the documents do not explicitly confirm the requested detail, treat it as NOT_FOUND.
- For example, explaining the difference between braces and clear aligners does NOT confirm that the clinic offers either treatment or accepts adult patients.
- When a requested detail is NOT_FOUND, do not guess. Offer to have the team contact the visitor.
- Never turn a partial limitation into a full yes or no.
  If the documents say one specific part of a service is not offered,
  say exactly that, and mention what IS offered if the results show it.
- Only say the business does NOT offer something when the documents say so directly.
- You may use common knowledge only to recognize what category something belongs to.
  Every fact about the business must come from the search results.
- If the visitor asks about a specific brand, model or item that the documents don't name,
  but the documents cover its category, say the item isn't named,
  then share what the documents say about that category.

  - If the visitor names a specific brand, model or product that the documents
  don't mention by name, but the documents describe its general category
  (for example electric vehicles or hybrids), this is NOT a NOT_FOUND case.
  Say the specific name isn't listed, then answer using what the documents
  say about that category, including any limits.
- Only use the category if the visitor's item clearly belongs to it.
  Being "a vehicle" or "a service" is too general to count.

Booking requests:
1. When the visitor wants to book, collect: the service, an exact date AND time,
   their name, and an email or phone. Ask only for what is missing.
   Use the whole conversation, not just the latest message.
2. Turn relative dates ("Monday", "tomorrow") into an exact date using the
   current date above. If they give only a date or only a time, ask for the other.
   If the time is vague ("morning", "after lunch"), ask for an exact time.
3. Before saving, repeat ALL the details (service, day and date, time, name, contact)
   and ask: "Shall I send this booking request?"
4. Call saveBooking only after the visitor clearly says yes.
   If they say no, do not save. If they change a detail, repeat the
   updated details and ask again.
5. After BOOKING_REQUESTED: say their request has been sent and the team
   will contact them to confirm it. Never say the booking is "confirmed" or "booked".
6. After ALREADY_REQUESTED: tell them this exact request was already sent.
7. After BOOKING_LIMIT_REACHED: tell them they've reached the maximum booking
   requests for this chat and the team will contact them.
8. If saveBooking returns an error, explain the problem (for example, the time
   is in the past) and ask for the corrected detail.
9. Do not call saveLead for a booking. A booking already includes their contact details.
10. Before repeating the booking details for confirmation, call searchDocs
    to check the business's opening hours and closed days.
    - If the requested day is a closed day, or the time is outside opening
      hours, tell the visitor the opening hours and ask for a different time.
      Do not ask for confirmation for that time.
    - If the documents don't list opening hours, continue normally;
      the team will confirm the time.




Lead information collection:
1. When a visitor wants the team to contact them, collect:
   - Their name
   - At least one contact method: email or phone.

2. Extract information from the entire conversation history,
   not just the latest message.

3. If the visitor provides only their name:
   Ask for their email address or phone number.

4. If the visitor provides only their email or phone:
   Ask for their name.

5. If the visitor provides neither:
   Ask for their name and email address or phone number.

6. If the visitor provides their name and at least one contact
   method, call saveLead.

7. If the visitor provides both email and phone, save both.

8. Never invent or assume missing contact information.

9. Generate topic and reason from the original business question.

10. Do not tell the visitor their lead was saved until
    saveLead confirms success.
`;
  // 3. Build the conversation for the LLM
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  let reply = FALLBACK;

  // 4. Tool loop: the LLM may search, then answers
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      messages,
      tools,
    });

    const msg = completion.choices[0].message;
   
   
    // No tool call = this is the final answer
    if (!msg.tool_calls?.length) {
      reply = msg.content ?? FALLBACK;
        console.log("FINAL ANSWER:", reply);
      break;
    }


    // The LLM wants to search: run each search and give it the results
    messages.push(msg);


 
 
   for (const call of msg.tool_calls) {
  if (call.type !== "function") continue;

  const args = parseToolArgs(call.function.arguments);

  if (!args) {
    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content:
        "ERROR: The arguments were not valid JSON. Call the tool again with a valid JSON object.",
    });
    continue; // go to the next tool call; do NOT crash
  }

  // Safety net: if any tool crashes, we still reply to this tool call
  // so every tool_call_id gets exactly one tool reply.
  try {
    let result;
    if (call.function.name === "saveLead") {
      result = await saveLead(args, businessId, sessionId);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    } else if (call.function.name === "saveBooking") {
      result = await saveBooking(args, businessId, sessionId);
      console.log("saveBooking", result);
      console.log(call);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    } else if (call.function.name === "searchDocs") {
      const query =
        typeof args.query === "string" && args.query.trim()
          ? args.query
          : message;
      const results = await searchDocs(businessId, query, 5);
      console.log("searchDocs", results);

      const relevant = results.filter((r) => r.score >= MIN_SCORE);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: relevant.length
          ? relevant.map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n")
          : "NO_RELEVANT_INFORMATION",
      });
    } else {
      // The model called a tool we don't have: still answer this call,
      // so every tool_call_id gets exactly one tool reply.
      console.warn("Unknown tool called:", call.function.name);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: `ERROR: Unknown tool "${call.function.name}". Use only searchDocs, saveLead or saveBooking.`,
      });
    }
  } catch (error) {
    // The tool crashed (DB down, embeddings API failed, etc.).
    // Don't crash the whole request: tell the model it failed instead.
    console.error(`Tool "${call.function.name}" failed:`, error);
    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content: `ERROR: The tool "${call.function.name}" failed because of a technical problem. Do not retry it. Apologise briefly to the visitor and offer to pass their question or contact details to the team.`,
    });
  }
}
  }

  const answered = reply !== FALLBACK;


console.log("FINAL ANSWER:", reply);


  // 5. Save the assistant's reply
  await saveMessage({ businessId, sessionId, role: "assistant", content: reply, answered });

  return { reply, answered };
}