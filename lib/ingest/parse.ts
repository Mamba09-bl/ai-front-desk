import { extractText, getDocumentProxy } from "unpdf";

export async function parsePdf(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());

  const pdf = await getDocumentProxy(buffer);

  const { text } = await extractText(pdf, {
    mergePages: true,
  });

  return text.trim();
}