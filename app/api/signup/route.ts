import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { signupSchema } from "@/lib/validations/signup";

const BCRYPT_ROUNDS = 12;

// Maps a unique index from prisma/migrations/0_init to the form field it guards.
const duplicateErrors: Record<string, { field: "username" | "email"; message: string }> = {
  users_username_key: { field: "username", message: "This username is already taken" },
  users_email_key: { field: "email", message: "An account with this email already exists" },
};

export async function POST(request: Request) {
  // Check this first, so we never save a user we can't log in.
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const result = signupSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        message: "Validation failed",
        errors: z.flattenError(result.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const { username, email, password } = result.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user: { id: string; username: string; email: string };
  try {
    user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true },
    });
    console.log(user);

  } catch (error) {
    // P2002 = unique violation: username or email already registered.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // The lower(...) indexes aren't in schema.prisma, so the index name is only
      // reported in the driver adapter's error details.
      const adapterError = error.meta?.driverAdapterError as
        | { cause?: { constraint?: { index?: string } } }
        | undefined;
      const index = adapterError?.cause?.constraint?.index;
      const dup = index ? duplicateErrors[index] : undefined;
      if (dup) {
        return Response.json(
          { message: dup.message, errors: { [dup.field]: [dup.message] } },
          { status: 409 },
        );
      }
    }
    console.error("Signup failed", error);
    return Response.json({ message: "Could not create account. Try again." }, { status: 500 });
  }

  // 1. Create the JWT: the user's id + username, signed with our secret, valid 7 days.
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: "7d" });

  // 2. Put the JWT in a cookie, so the browser sends it back on every request.
  const res = NextResponse.json({ message: "Account created", user }, { status: 201 });
  res.cookies.set("token", token, {
    httpOnly: true, // page JavaScript can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, same as the JWT
  });

  return res;
}
