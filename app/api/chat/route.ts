
// app/api/chat/route.ts
import { z } from "zod";
import { prisma } from "@/lib/db";
import { runAssistant } from "@/lib/assistant/runAssistant";
import redis from "@/lib/client";

const IP_LIMIT_PER_MINUTE = 3;
const GLOBAL_LIMIT_PER_DAY = 500;

const bodySchema = z.object({
  publicKey: z.string().startsWith("pk_"),
  sessionId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
});

// Returns true when the request should be blocked
async function isRateLimited(key: string, limit: number, windowSeconds: number) {
  try {
    const count = await redis.incr(key);

    // First request in this window → start the timer
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > limit) {
      // Safety: if EXPIRE was lost, the key would block this IP forever
      const ttl = await redis.ttl(key);
      if (ttl === -1) await redis.expire(key, windowSeconds);
      return true;
    }

    return false;
  } catch (err) {
    // Redis is down → let the request through (fail open), so the chat keeps working
    console.error("Rate limit check failed:", err);
    return false;
  }
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // 1. Per-IP limit: one person spamming
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (await isRateLimited(`rate-limit:ip:${ip}`, IP_LIMIT_PER_MINUTE, 60)) {
    return Response.json(
      { error: "You're sending messages too quickly. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 2. Global daily limit: protects your Groq bill
  const today = new Date().toISOString().slice(0, 10); // "2026-11-11"

  if (await isRateLimited(`rate-limit:global:${today}`, GLOBAL_LIMIT_PER_DAY, 86400)) {
    return Response.json(
      { error: "The assistant is busy right now. Please try again later." },
      { status: 429 }
    );
  }

  // 3. Normal flow
  const business = await prisma.business.findUnique({
    where: { publicKey: parsed.data.publicKey },
    select: { id: true },
  });
  if (!business) {
    return Response.json({ error: "Invalid key" }, { status: 404 });
  }

  const result = await runAssistant({
    businessId: business.id,
    sessionId: parsed.data.sessionId,
    message: parsed.data.message,
  });

  return Response.json({ reply: result.reply });
}