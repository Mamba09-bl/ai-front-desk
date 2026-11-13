import { TIMEZONE } from "@/lib/config";

export type BookingRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service: string;
  startTime: Date;
  notes: string | null;
  status: string;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-violet-500/10 text-violet-300 ring-violet-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  cancelled: "bg-red-500/10 text-red-300 ring-red-500/30",
};

// Converts the stored UTC time back to Karachi time, the same on a laptop or on Vercel.
const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short", month: "short", day: "numeric",
  hour: "numeric", minute: "2-digit",
  timeZone: TIMEZONE,
}); // e.g. "Mon, Nov 9, 10:00 AM"

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: TIMEZONE });

export default function Bookings({ bookings }: { bookings: BookingRow[] }) {
  return (
    <>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bookings</h1>
        <p className="text-sm text-zinc-500">
          {bookings.length} {bookings.length === 1 ? "request" : "requests"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-zinc-800/80 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Requested time</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top">
                <td className="px-5 py-4 font-medium text-zinc-200">{booking.name}</td>
                <td className="px-5 py-4 text-zinc-400">
                  {booking.phone && (
                    <a href={`tel:${booking.phone}`} className="block hover:text-zinc-200">
                      {booking.phone}
                    </a>
                  )}
                  {booking.email && (
                    <a href={`mailto:${booking.email}`} className="block hover:text-zinc-200">
                      {booking.email}
                    </a>
                  )}
                  {!booking.phone && !booking.email && "—"}
                </td>
                <td className="max-w-xs px-5 py-4 text-zinc-300">
                  {booking.service}
                  {booking.notes && <p className="mt-1 text-xs text-zinc-500">{booking.notes}</p>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-zinc-200">
                  {TIME_FORMAT.format(booking.startTime)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${
                      STATUS_STYLES[booking.status] ?? "bg-zinc-800 text-zinc-300 ring-zinc-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                  {DATE_FORMAT.format(booking.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
