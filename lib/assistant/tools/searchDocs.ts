// lib/assistant/tools/searchDocs.ts
import { prisma } from "@/lib/db";
import { embedTexts } from "@/lib/ingest/embed";

export type SearchResult = { id: string; content: string; score: number };

export async function searchDocs(
  businessId: string,
  question: string,
  limit = 5
): Promise<SearchResult[]> {
  const [questionVector] = await embedTexts([question]);
  const vector = `[${questionVector.join(",")}]`;

  return prisma.$queryRaw<SearchResult[]>`
    SELECT id, content, 1 - (embedding <=> ${vector}::vector) AS score
    FROM "Chunk"
    WHERE "businessId" = ${businessId}
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;
}