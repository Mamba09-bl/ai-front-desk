import { Suspense } from "react";
import { getCurrentBusiness } from "@/lib/dal";
import DashboardShell from "./DashboardShell";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // The session read is kept inside Suspense so the shell can render without waiting on it.
  return (
    <DashboardShell
      businessBadge={
        <Suspense fallback={<BusinessBadgeSkeleton />}>
          <BusinessBadge />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}

async function BusinessBadge() {
  const business = await getCurrentBusiness();

  return (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-violet-500/30">
        {business.name.charAt(0).toUpperCase()}
      </div>
      <span className="truncate text-sm font-semibold">{business.name}</span>
    </>
  );
}

function BusinessBadgeSkeleton() {
  return (
    <>
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-zinc-800" />
      <div className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
    </>
  );
}
