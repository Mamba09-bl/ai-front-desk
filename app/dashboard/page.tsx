import { Suspense } from "react";
import { getCurrentBusiness } from "@/lib/dal";
import OverviewClient from "./OverviewClient";

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  // Checked here too, not just in the layout: layouts don't re-render on client navigation.
  const business = await getCurrentBusiness();
  return <OverviewClient business={business} />;
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-4 w-72 rounded bg-zinc-800/70" />
      </div>
      <div className="h-40 rounded-2xl border border-zinc-800/80 bg-zinc-900/60" />
      <div className="h-56 rounded-2xl border border-zinc-800/80 bg-zinc-900/60" />
    </div>
  );
}
