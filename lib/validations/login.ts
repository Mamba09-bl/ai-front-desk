import { z } from "zod";

// Login only checks that fields are filled in; strength rules belong to signup.
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginInput, string[]>>;
 