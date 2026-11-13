"use client";

import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

type Screen = "form" | "keys";
type KeyKind = "public";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "Business name is required.";
  if (trimmed.length < MIN_NAME_LENGTH) return `Business name must be at least ${MIN_NAME_LENGTH} characters.`;
  if (trimmed.length > MAX_NAME_LENGTH) return `Business name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  return null;
}

export default function OnboardingForm() {
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("form");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keys, setKeys] = useState<Record<KeyKind, string>>({ public: "" });
  const [copyStatus, setCopyStatus] = useState<{ kind: KeyKind; ok: boolean } | null>(null);

  // A ref updates synchronously, so rapid double clicks can't slip past before state re-renders.
  const submittingRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setBusinessName(e.target.value);
    if (error) setError(validateName(e.target.value));
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;

    const validationError = validateName(businessName);
    if (validationError) {
      setError(validationError);
      return;
    }

    submittingRef.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: businessName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // A business was created meanwhile (e.g. in another tab): re-render the
        // server page, which now shows the "already have a business" message.
        router.refresh();
        return;
      }
      if (!res.ok) {
        setError(data.errors?.businessName?.[0] ?? data.message ?? "Couldn't create your business. Try again.");
        return;
      }

      if (typeof data.publicKey !== "string") {
        setError("Couldn't load your business key. Try again.");
        return;
      }

      setBusinessName(data.business?.name ?? businessName);
      setKeys({ public: data.publicKey });
      setScreen("keys");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  async function handleCopy(kind: KeyKind) {
    let ok = false;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(keys[kind]);
      ok = true;
    } catch {
      ok = false;
    }

    setCopyStatus({ kind, ok });
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyStatus(null), ok ? 2000 : 4000);
  }

  const errorId = "business-name-error";

  return (
    <>
      {screen === "form" ? (
        <>
          <div className="mb-8">
            <p className="mb-6 text-xs font-medium uppercase tracking-wider text-zinc-500">Step 1 of 2</p>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <svg aria-hidden="true" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s set up your business</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Create a business workspace to get started. Your AI assistant and keys will live here.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="business-name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Business name
              </label>
              <input
                id="business-name"
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Acme Inc."
                value={businessName}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`h-11 w-full rounded-lg border bg-zinc-950/60 px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:ring-4 disabled:opacity-60 ${
                  error
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
                    : "border-zinc-800 hover:border-zinc-700 focus:border-violet-500 focus:ring-violet-500/15"
                }`}
              />
              {error && (
                <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-400">
                  <svg aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>
                    <span className="sr-only">Error: </span>
                    {error}
                  </span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </span>
              ) : (
                "Create business"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-6 text-xs font-medium uppercase tracking-wider text-zinc-500">Step 2 of 2</p>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
              <svg aria-hidden="true" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Your business is ready</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              <span className="font-medium text-zinc-200">{businessName.trim()}</span> has been created. The key
              below will be used to connect your business assistant.
            </p>
          </div>

          <div className="space-y-5">
            {(
              [
                { kind: "public", label: "Public key", hint: "Safe to use in client-side code." },
              ] as const
            ).map(({ kind, label, hint }) => {
              const inputId = `${kind}-key`;
              const status = copyStatus?.kind === kind ? copyStatus : null;
              return (
                <div key={kind}>
                  <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
                    {label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={inputId}
                      type="text"
                      readOnly
                      value={keys[kind]}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-describedby={`${inputId}-hint`}
                      spellCheck={false}
                      className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3.5 font-mono text-xs text-zinc-200 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(kind)}
                      aria-label={`Copy ${label.toLowerCase()}`}
                      className={`flex h-11 w-24 shrink-0 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
                        status?.ok
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
                      }`}
                    >
                      {status?.ok ? (
                        <>
                          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        "Copy"
                      )}
                    </button>
                  </div>
                  <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-zinc-500">
                    {hint}
                  </p>
                  {status && !status.ok && (
                    <p className="mt-1 text-xs text-red-400">
                      Couldn&apos;t copy automatically. Select the key above and copy it manually.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Announces copy results to screen readers. */}
          <p aria-live="polite" className="sr-only">
            {copyStatus
              ? copyStatus.ok
                ? "Public key copied to clipboard."
                : "Copy failed. Select the key and copy it manually."
              : ""}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-8 flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Continue to dashboard
          </button>
        </>
      )}
    </>
  );
}
