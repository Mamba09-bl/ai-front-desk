import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().nullable(),
  phone: z.string().trim().nullable(),
  topic: z.string().trim().min(2).max(150),
  reason: z.string().trim().min(5).max(500),
}).refine(
  (data) => Boolean(data.email || data.phone),
  {
    message: "Email or phone number is required",
    path: ["email"],
  }
);