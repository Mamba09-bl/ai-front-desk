// Shared button styles for the landing page, matching the auth pages' primary button.
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export const primaryButton = `${base} bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:brightness-110`;

export const secondaryButton = `${base} border border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800`;

export const ghostButton = `${base} text-zinc-300 hover:bg-zinc-800/60 hover:text-white`;
