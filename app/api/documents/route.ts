import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { parsePdf } from "@/lib/ingest/parse";
import {chunkText} from '@/lib/ingest/chunk'
import { embedTexts } from '@/lib/ingest/embed';
import { saveChunks } from '@/lib/ingest/saveChunks';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOCUMENTS = 20;

export async function POST(request: Request) {
  // 1. Who is uploading?
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

   const business = await prisma.business.findUnique({
    where: { ownerId: session.userId },
    select: { id: true },
  });
  if (!business) {
    return Response.json({ error: "No business found" }, { status: 404 });
  }

  const documentCount = await prisma.document.count({
    where: {
      businessId: business.id,
      status: { not: "failed" }, // failed uploads don't use up the limit
    },
  });

   if (documentCount >= MAX_DOCUMENTS) {
    return Response.json(
      { error: `Document limit reached (max ${MAX_DOCUMENTS})` },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  
  
  
  // formData.get() returns a string for text fields, so check it's actually a file.
 if (!(file instanceof File)) {
    return Response.json({ error: "No file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File is too large (max 10 MB)" }, { status: 400 });
  }


   const existing = await prisma.document.findFirst({
    where: {
      businessId: business.id,
      name: file.name,
      status: { not: "failed" }, // a failed upload can be retried
    },
    select: { id: true },
  });

  if (existing) {
    return Response.json(
      { error: "A document with this name already exists" },
      { status: 409 }
    );
  }

   const document = await prisma.document.create({
    data: {
      businessId: business.id,
      name: file.name,
      status: "processing",
    },
    select: { id: true, name: true, status: true, createdAt: true },
  });
  

  // app/api/documents/route.ts  (after prisma.document.create)

try {
  const text = await parsePdf(file);

  if (!text) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "failed", error: "No text found. Is this a scanned PDF?" },
    });
    return Response.json({ error: "No text found in PDF" }, { status: 422 });
  }

  const chunks = await chunkText(text);
 const vectors = await embedTexts(chunks);
   await saveChunks(
    business.id,
    document.id,
    chunks,
    vectors
  );

  // console.log("Chunks:", chunks.length);
  // console.log('vectors',vectors);
  
  
}catch (err) {
  console.error("DOCUMENT PROCESSING ERROR:", err);

  await prisma.document.update({
    where: { id: document.id },
    data: {
      status: "failed",
      error: "Document processing failed",
    },
  });

  return Response.json(
    { error: "Document processing failed" },
    { status: 422 }
  );
}

return Response.json(document, { status: 201 });
}
