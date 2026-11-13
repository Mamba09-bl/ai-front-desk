// lib/auth/session.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getSession() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);

    if (typeof payload.id !== "string") {
      return null;
    }

    return { userId: payload.id };
  } catch {
    return null;
  }
}