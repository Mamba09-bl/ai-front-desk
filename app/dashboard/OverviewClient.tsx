"use client";

import { useEffect, useRef, useState } from "react";
import type { CurrentBusiness } from "@/lib/dal";

type CopyTarget = "publicKey" | "script";

const WIDGET_SRC = "https://yourapp.com/widget.js";

export default function OverviewClient({ business }: { business: CurrentBusiness }) {
  const [copyStatus, setCopyStatus] = useState<{ target: CopyTarget; ok: boolean } | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scriptTag = `<script src="${WIDGET_SRC}" data-key="${business.publicKey}"></script>`;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  async function handleCopy(target: CopyTarget) {
    let ok = false;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(target === "publicKey" ? business.publicKey : scriptTag);
      ok = true;
    } catch {
      ok = false;
    }

    setCopyStatus({ target, ok });
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyStatus(null), ok ? 2000 : 4000);
  }

  function renderCopyButton(target: CopyTarget, label: string) {
    const status = copyStatus?.target === target ? copyStatus : null;
    return (
      <button
        type="button"
        onClick={() => handleCopy(target)}
        aria-label={label}
        className={`flex h-9 w-20 shrink-0 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
          status?.ok
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
        }`}
      >
        {status?.ok ? (
          <>
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied
          </>
        ) : (
          "Copy"
        )}
      </button>
    );
  }

  function renderCopyError(target: CopyTarget) {
    if (copyStatus?.target !== target || copyStatus.ok) return null;
    return <p className="mt-2 text-xs text-red-400">Couldn&apos;t copy automatically. Select the text and copy it manually.</p>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{business.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">Add the widget to your site to put your assistant to work.</p>
      </div>

      <div className="space-y-5">
        {/* Install snippet */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Install the widget</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Paste this before the closing <code className="font-mono text-zinc-400">&lt;/body&gt;</code> tag on every page.
              </p>
            </div>
            {renderCopyButton("script", "Copy script tag")}
          </div>
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs leading-relaxed text-zinc-300">
            <code>
              <span className="text-zinc-500">&lt;</span>
              <span className="text-violet-300">script</span> <span className="text-cyan-300">src</span>
              <span className="text-zinc-500">=</span>
              <span className="text-emerald-300">&quot;{WIDGET_SRC}&quot;</span> <span className="text-cyan-300">data-key</span>
              <span className="text-zinc-500">=</span>
              <span className="text-emerald-300">&quot;{business.publicKey}&quot;</span>
              <span className="text-zinc-500">&gt;&lt;/</span>
              <span className="text-violet-300">script</span>
              <span className="text-zinc-500">&gt;</span>
            </code>
          </pre>
          {renderCopyError("script")}
        </section>

        {/* Keys */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6">
          <h3 className="mb-5 text-sm font-semibold">API keys</h3>

          <div className="space-y-5">
            <div>
              <label htmlFor="public-key" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Public key
              </label>
              <div className="flex gap-2">
                <input
                  id="public-key"
                  type="text"
                  readOnly
                  value={business.publicKey}
                  onFocus={(e) => e.currentTarget.select()}
                  spellCheck={false}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 font-mono text-xs text-zinc-200 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
                />
                {renderCopyButton("publicKey", "Copy public key")}
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">Safe to use in client-side code.</p>
              {renderCopyError("publicKey")}
            </div>
          </div>
        </section>
      </div>

      {/* Announces copy results to screen readers. */}
      <p aria-live="polite" className="sr-only">
        {copyStatus
          ? copyStatus.ok
            ? `${copyStatus.target === "publicKey" ? "Public key" : "Script tag"} copied to clipboard.`
            : "Copy failed. Select the text and copy it manually."
          : ""}
      </p>
    </>
  );
}
