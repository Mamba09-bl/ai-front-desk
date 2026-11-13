import { Suspense } from "react";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import EmptyState from "../EmptyState";
import DocumentUpload from "./DocumentUpload";

export default function DocumentsPage() {
  return (
    <Suspense>
      <Documents />
    </Suspense>
  );
}

async function Documents() {
  // Verifies the user and finds their business; redirects to /login or /onboarding otherwise.
  const business = await getCurrentBusiness();

  // publicKey is unique per business, so it identifies the business without needing its id.
  const documents = await prisma.document.findMany({
    where: { business: { publicKey: business.publicKey } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, status: true, error: true, createdAt: true },
  });

  if (documents.length === 0) {
    return (
      <EmptyState section="documents">
        <DocumentUpload documents={documents} />
      </EmptyState>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">Documents</h1>
      <DocumentUpload documents={documents} />
    </>
  );
}
