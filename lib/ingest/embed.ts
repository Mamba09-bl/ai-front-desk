import OpenAI from "openai";

const openai = new OpenAI(); // reads OPENAI_API_KEY from .env

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,   // all chunks in ONE request
  });
  return res.data.map((d) => d.embedding);
}