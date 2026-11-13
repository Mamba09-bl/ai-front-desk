export type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  topic: string;
  reason: string;
  status: string;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-violet-500/10 text-violet-300 ring-violet-500/30",
  contacted: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  closed: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
};

const REASON_LABELS: Record<string, string> = {
  unanswered_question: "Unanswered question",
  interested: "Interested",
  callback_request: "Callback request",
};

// Fixed locale and time zone so the output is the same wherever it renders.
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default function Leads({ leads }: { leads: LeadRow[] }) {
  return (
    <>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Leads</h1>
        <p className="text-sm text-zinc-500">
          {leads.length} {leads.length === 1 ? "lead" : "leads"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-800/80 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Asked about</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top">
                <td className="px-5 py-4 font-medium text-zinc-200">{lead.name}</td>
                <td className="px-5 py-4 text-zinc-400">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="block hover:text-zinc-200">
                      {lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="block hover:text-zinc-200">
                      {lead.email}
                    </a>
                  )}
                  {!lead.phone && !lead.email && "—"}
                </td>
                <td className="max-w-xs px-5 py-4 text-zinc-300">{lead.topic}</td>
                <td className="px-5 py-4 text-zinc-400">{REASON_LABELS[lead.reason] ?? lead.reason}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${
                      STATUS_STYLES[lead.status] ?? "bg-zinc-800 text-zinc-300 ring-zinc-700"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-zinc-500">{DATE_FORMAT.format(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
