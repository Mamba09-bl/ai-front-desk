import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative w-full max-w-lg">
        <div className="rounded-2xl bg-gradient-to-b from-white/15 to-white/[0.03] p-px shadow-2xl shadow-violet-950/40">
          <div className="rounded-2xl bg-zinc-900/80 p-6 backdrop-blur-xl sm:p-10">
            {/* cacheComponents is on, so uncached DB/session reads must sit inside a Suspense boundary. */}
            <Suspense>
              <OnboardingContent />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

async function OnboardingContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { ownerId: session.userId },
    select: { name: true },
  });

  if (!business) return <OnboardingForm />;

  return (
    <>
      <div className="mb-8">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/40">
          <svg aria-hidden="true" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">You can&apos;t create another business</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Your account already has a business,{" "}
          <span className="font-medium text-zinc-200">{business.name}</span>. Each account can have only one.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      >
        Back to dashboard
      </Link>
    </>
  );
}
