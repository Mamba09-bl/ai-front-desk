import type { ReactNode } from "react";
import Icon from "./Icon";
import { ICONS, NAV, type Section } from "./nav";

type EmptySection = Exclude<Section, "overview">;

const EMPTY_STATES: Record<EmptySection, { title: string; body: string }> = {
  documents: {
    title: "No documents yet",
    body: "Upload FAQs, menus, or policies and your assistant will use them to answer customers.",
  },
  leads: {
    title: "No leads yet",
    body: "When visitors share their contact details through the widget, they'll show up here.",
  },
  bookings: {
    title: "No bookings yet",
    body: "Appointments booked through your assistant will appear here.",
  },
};

// children render between the heading and the empty state, e.g. an upload form.
export default function EmptyState({ section, children }: { section: EmptySection; children?: ReactNode }) {
  const label = NAV.find((item) => item.id === section)?.label;

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">{label}</h1>
      {children}
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-400 ring-1 ring-zinc-700/60">
          <Icon d={ICONS[section]} className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">{EMPTY_STATES[section].title}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{EMPTY_STATES[section].body}</p>
      </div>
    </>
  );
}
