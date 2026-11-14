import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { ghostButton, primaryButton } from "./buttons";

// Reads the session cookie, so it must render inside a <Suspense> boundary (Cache Components).
export default async function NavAuthLinks() {
  const session = await getSession();

  if (session) {
    return (
      <Link href="/dashboard" className={`${primaryButton} h-9 px-4 text-sm`}>
        Go to dashboard
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className={`${ghostButton} h-9 px-3 text-sm`}>
        Log in
      </Link>
      <Link href="/signup" className={`${primaryButton} h-9 px-4 text-sm`}>
        Get started
      </Link>
    </>
  );
}
