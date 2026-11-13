import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import EmptyState from "../EmptyState";
import Leads from "./leads";

export default function LeadsPage() {
  // cacheComponents is on, so uncached DB/session reads must sit inside a Suspense boundary.
  return (
    <Suspense>
      <LeadsData />
    </Suspense>
  );
}

async function LeadsData() {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { ownerId: session.userId },
    select: { id: true },
  });
  if (!business) redirect("/onboarding");

  const leads = await prisma.lead.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      topic: true,
      reason: true,
      status: true,
      createdAt: true,
    },
  });

  if (leads.length === 0) {
    return <EmptyState section="leads" />;
  }

  return <Leads leads={leads} />;
}
