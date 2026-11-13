import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// Memoized per request, so the dashboard layout and page share one session check and query.
export const getCurrentBusiness = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const business = await prisma.business.findUnique({
    where: {
      ownerId: session.userId,
    },
    select: {
      name: true,
      publicKey: true,
    },
  });

  if (!business) {
    redirect("/onboarding");
  }

  return business;
});

export type CurrentBusiness = Awaited<ReturnType<typeof getCurrentBusiness>>;
