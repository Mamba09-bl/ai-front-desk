// app/api/chat/history/route.ts
import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const querySchema = z.object({
  publicKey: z.string().startsWith("pk_"),
  sessionId: z.string().uuid(),
});

const MAX_MESSAGES = 100;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    publicKey: params.get("publicKey"),
    sessionId: params.get("sessionId"),
  });
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { publicKey: parsed.data.publicKey },
    select: { id: true },
  });
  if (!business) {
    return Response.json({ error: "Invalid key" }, { status: 404 });
  }

  // Newest 100, then flipped back to oldest-first for display
  const rows = await prisma.message.findMany({
    where: {
      businessId: business.id,
      sessionId: parsed.data.sessionId,
      role: { in: ["user", "assistant"] },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_MESSAGES,
    select: { role: true, content: true },
  });

  return Response.json({ messages: rows.reverse() });
}
