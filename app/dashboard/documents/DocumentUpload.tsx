"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "success"; name: string } | { kind: "error"; message: string };

type DocumentRow = { id: string; name: string; status: string; error: string | null; createdAt: Date };

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  ready: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  failed: "bg-red-500/10 text-red-300 ring-red-500/30",
};

// Fixed locale and time zone so the server and browser render the same date (no hydration mismatch).
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default function DocumentUpload({ documents }: { documents: DocumentRow[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;

    setStatus({ kind: "uploading" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatus({ kind: "error", message: data?.message ?? "Upload failed. Try again." });
        return;
      }
      setStatus({ kind: "success", name: file.name });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      // Re-run the server page so the new document shows up in the list.
      router.refresh();
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  return (
    <>
    <section className="mb-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6">
      <h3 className="text-sm font-semibold">Upload a document</h3>
      <p className="mt-1 text-xs text-zinc-500">PDF files only.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          aria-label="Choose a PDF"
          onChange={(e) => {
            setFile(e.currentTarget.files?.[0] ?? null);
            setStatus({ kind: "idle" });
          }}
          className="min-w-0 flex-1 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border file:border-zinc-700 file:bg-zinc-800/60 file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-200 hover:file:bg-zinc-800"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || status.kind === "uploading"}
          className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 text-xs font-medium text-white transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </div>

      <p aria-live="polite" className="mt-3 text-xs empty:hidden">
        {status.kind === "success" && <span className="text-emerald-300">Uploaded {status.name}.</span>}
        {status.kind === "error" && <span className="text-red-400">{status.message}</span>}
      </p>
    </section>

    {documents.length > 0 && (
      <ul className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{doc.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {doc.error ?? `Uploaded ${DATE_FORMAT.format(doc.createdAt)}`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${
                STATUS_STYLES[doc.status] ?? "bg-zinc-800 text-zinc-300 ring-zinc-700"
              }`}
            >
              {doc.status}
            </span>
          </li>
        ))}
      </ul>
    )}
    </>
  );
}
