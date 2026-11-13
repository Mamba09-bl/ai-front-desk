import { z } from "zod";
import { TIMEZONE_OFFSET } from "@/lib/config";

// The model sends Karachi local time with no offset, e.g. "2026-11-09T10:00".
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// JS turns impossible dates into real ones ("2026-02-30" becomes 2 March),
// so parse and format it back: a real date comes back unchanged.
const isRealDate = (s: string) =>
  new Date(`${s}:00Z`).toISOString().slice(0, 16) === s;

export const bookingSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().nullable(),
    phone: z.string().trim().nullable(),
    service: z.string().trim().min(2).max(150),
    startTime: z
      .string()
      .trim()
      .regex(LOCAL_DATETIME, "Use the format YYYY-MM-DDTHH:mm")
      .refine(isRealDate, "This date does not exist")
      // Karachi local time -> the exact moment in UTC
      .transform((s) => new Date(`${s}:00${TIMEZONE_OFFSET}`))
      .refine((d) => d > new Date(), "Booking time must be in the future"),
    notes: z.string().trim().max(500).nullable(),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Email or phone number is required",
    path: ["email"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
