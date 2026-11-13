// app/widget/[publicKey]/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import ChatWindow from './ChatWindow'

export default function WidgetPage({
  params,
}: {
  params: Promise<{ publicKey: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <WidgetContent params={params} />
    </Suspense>
  );
}

async function WidgetContent({
  params,
}: {
  params: Promise<{ publicKey: string }>;
}) {
  const { publicKey } = await params;

  const business = await prisma.business.findUnique({
    where: { publicKey },
    select: { name: true },
  });

  if (!business) return <p>Assistant not found</p>;

  return <ChatWindow businessName={business.name} publicKey={publicKey} />;
}