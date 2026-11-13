import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SignupFieldErrors = Partial<Record<keyof SignupInput, string[]>>;
