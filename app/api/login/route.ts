import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/login";

// Compared against when no user matches, so a wrong email takes as long as a
// wrong password and response times don't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

const INVALID_CREDENTIALS = "Invalid email/username or password";

export async function POST(request: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        message: "Validation failed",
        errors: z.flattenError(result.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const { identifier, password } = result.data;

  let user: { id: string; username: string; email: string; password_hash: string } | undefined;
  try {
    // Usernames can't contain "@", so an identifier matches at most one user.
    // Raw SQL on purpose: Prisma's mode: "insensitive" compiles to ILIKE, where
    // "_" (allowed in usernames) is a wildcard; lower() = lower() is exact and
    // uses the users_email_key / users_username_key indexes.
    const rows = await prisma.$queryRaw<NonNullable<typeof user>[]>`
      SELECT id, username, email, password_hash
      FROM users
      WHERE lower(email) = lower(${identifier}) OR lower(username) = lower(${identifier})
      LIMIT 1`;
    user = rows[0];
  } catch (error) {
    console.error("Login failed", error);
    return Response.json({ message: "Could not sign in. Try again." }, { status: 500 });
  }

  const passwordOk = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    return Response.json({ message: INVALID_CREDENTIALS }, { status: 401 });
  }

  // 1. Create the JWT: the user's id + username, signed with our secret, valid 7 days.
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: "7d" });

  // 2. Put the JWT in a cookie, so the browser sends it back on every request.
  const res = NextResponse.json(
    { message: "Signed in", user: { id: user.id, username: user.username, email: user.email } },
    { status: 200 },
  );
  res.cookies.set("token", token, {
    httpOnly: true, // page JavaScript can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, same as the JWT
  });

  return res;
}
