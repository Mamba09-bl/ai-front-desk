import { prisma } from "@/lib/db";
import { bookingSchema } from "../schemas/bookingSchema";
import { sendWebhook } from "@/lib/integrations/sendWebhook";
import { TIMEZONE } from "@/lib/config";

const MAX_BOOKINGS_PER_SESSION = 3;

export async function saveBooking(
  args: unknown,
  businessId: string,
  sessionId: string
) {
  // 1. Validate (same as saveLead)
  const parsed = bookingSchema.safeParse(args);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  const { service, startTime } = parsed.data; // startTime is already a UTC Date

  try {
    // 2. Load this session's bookings once, for both checks
    const existing = await prisma.booking.findMany({
      where: { businessId, sessionId },
      select: { service: true, startTime: true },
    });

    // 3. Same service + same time already requested → don't save again
    const duplicate = existing.some(
      (b) =>
        b.service.toLowerCase() === service.toLowerCase() &&
        b.startTime.getTime() === startTime.getTime()
    );
    if (duplicate) {
      return { success: false, message: "ALREADY_REQUESTED" };
    }

    // 4. Cap per session (spam protection)
    if (existing.length >= MAX_BOOKINGS_PER_SESSION) {
      return { success: false, message: "BOOKING_LIMIT_REACHED" };
    }

    // 5. Save as a request; the owner confirms it later
   const booking =  await prisma.booking.create({
      data: {
        ...parsed.data,
        businessId,
        sessionId,
        status: "requested",
      },
    });
    await sendWebhook(process.env.N8N_BOOKING_WEBHOOK_URL, "booking.created", {
  id: booking.id,
  name: booking.name,
  phone: booking.phone,
  email: booking.email,
  service: booking.service,
  notes: booking.notes,
  startTime: booking.startTime.toISOString(), // UTC, for machines (Calendar)
  startTimeLocal: new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(booking.startTime), // "Nov 9, 2026, 10:00 AM", for people
  status: booking.status,
});

    return {
      success: true,
      message: "BOOKING_REQUESTED",
      
    }
  } catch (error) {
    console.error("saveBooking failed:", error);
    return {
      success: false,
      error: "Failed to save booking",
    };
  }
}
