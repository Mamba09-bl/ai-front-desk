import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "searchDocs",
      description:
        "Search the business knowledge base for information relevant to the visitor's question.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
          description:
  "Search this business's uploaded documents. Write the query as ONE complete, standalone question about the CURRENT topic only. Use the conversation to resolve words like 'it', 'that', or 'Monday'. If the visitor changed topic, search only the new topic. If the visitor names a specific brand, model or product, include its general category in the query, because the documents may only use the general term (for example 'Tesla' → 'Tesla electric vehicle service').",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "saveLead",
      description:
        "Save visitor contact information when they want the business team to contact them.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          topic: { type: "string" },
          reason: { type: "string" },
        },
        required: ["name", "email", "phone", "topic", "reason"],
        additionalProperties: false,
      },
    },
  },
    {
    type: "function",
    function: {
      name: "saveBooking",
      description:
        "Save a booking REQUEST (not a confirmed appointment). Call only after you have the service, an exact date and time, the visitor's name and an email or phone, AND you have repeated all the details back and the visitor said yes. If they said no or changed a detail, confirm the new details first.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Visitor's name as they gave it. If a lead is already saved, reuse that name.",
          },
          email: {
            type: ["string", "null"],
            description: "Visitor's email, or null if not given. Never invent one.",
          },
          phone: {
            type: ["string", "null"],
            description: "Visitor's phone number, or null if not given. Never invent one.",
          },
          service: {
            type: "string",
            description: "The service they want to book, e.g. 'brake check'.",
          },
          startTime: {
            type: "string",
            description:
              "Requested date and time in Karachi local time, format YYYY-MM-DDTHH:mm (24-hour, no timezone), e.g. '2026-11-09T10:00'. Work out the exact date from the current date given in the instructions.",
          },
          notes: {
            type: ["string", "null"],
            description: "Anything extra the visitor mentioned about the booking, or null.",
          },
        },
        required: ["name", "email", "phone", "service", "startTime", "notes"],
        additionalProperties: false,
      },
    },
  },

];