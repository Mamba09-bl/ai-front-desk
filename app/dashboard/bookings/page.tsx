import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import EmptyState from "../EmptyState";
import Bookings from "./bookings";

export default function BookingsPage() {
  // cacheComponents is on, so uncached DB/session reads must sit inside a Suspense boundary.
  return (
    <Suspense>
      <BookingsData />
    </Suspense>
  );
}

async function BookingsData() {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { ownerId: session.userId },
    select: { id: true },
  });
  if (!business) redirect("/onboarding");

  const bookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    orderBy: { startTime: "asc" }, // soonest appointment first
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      service: true,
      startTime: true,
      notes: true,
      status: true,
      createdAt: true,
    },
  });

  if (bookings.length === 0) {
    return <EmptyState section="bookings" />;
  }

  return <Bookings bookings={bookings} />;
}
