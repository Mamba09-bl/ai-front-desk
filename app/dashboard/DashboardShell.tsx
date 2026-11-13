"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import { ICONS, NAV, isActive } from "./nav";

export default function DashboardShell({ businessBadge, children }: { businessBadge: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel = NAV.find((item) => isActive(item.href, pathname))?.label;

  return (
    <div className="relative flex min-h-screen flex-1 bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-5">{businessBadge}</div>

        <nav aria-label="Dashboard" className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  active ? "bg-violet-500/15 text-violet-200" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
              >
                <Icon d={ICONS[item.id]} className={`h-5 w-5 ${active ? "text-violet-300" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-xl sm:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="-ml-1 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 lg:hidden"
          >
            <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </button>
          <h2 className="text-sm font-medium text-zinc-400">{activeLabel}</h2>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8 sm:py-12">{children}</main>
      </div>
    </div>
  );
}
