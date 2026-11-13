import { prisma } from "@/lib/db";

export async function getRecentMessages(businessId: string, sessionId: string, limit = 10) {
  const rows = await prisma.message.findMany({
    where: { businessId, sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { role: true, content: true },
  });
  return rows.reverse(); // oldest first, the order a conversation is read in
}

export async function saveMessage(data: {
  businessId: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  answered?: boolean;
}) {
  return prisma.message.create({ data });
}