// lib/ingest/saveChunks.ts
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

export async function saveChunks(
  businessId: string,
  documentId: string,
  chunks: string[],
  vectors: number[][]
) {
  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < chunks.length; i++) {
        const vector = `[${vectors[i].join(",")}]`;
        await tx.$executeRaw`
          INSERT INTO "Chunk" (id, "businessId", "documentId", content, embedding)
          VALUES (${randomUUID()}, ${businessId}, ${documentId}, ${chunks[i]}, ${vector}::vector)
        `;
      }

      await tx.document.update({
        where: { id: documentId },
        data: { status: "ready" },
      });
    },
    { timeout: 30_000 }
  );
}