// lib/ingest/chunk.ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,    // max characters per chunk
  chunkOverlap: 200,  // characters shared with the previous chunk
});

export async function chunkText(text: string): Promise<string[]> {
  const cleaned = text
    .replace(/[ \t]+/g, " ")      // many spaces → one space
    .replace(/\n{3,}/g, "\n\n")   // many empty lines → one empty line
    .trim();

  return splitter.splitText(cleaned);
}