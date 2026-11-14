import type { ReactNode } from "react";

// Dark background with ambient glow + the glass card used by the auth pages.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-zinc-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-gradient-to-b from-white/15 to-white/[0.03] p-px shadow-2xl shadow-violet-950/40">
          <div className="rounded-2xl bg-zinc-900/80 p-8 backdrop-blur-xl sm:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
