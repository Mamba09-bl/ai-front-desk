
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Icon from "@/app/dashboard/Icon";
import { ICONS } from "@/app/dashboard/nav";
import DemoLink from "@/components/landing/DemoLink";
import DemoWidget from "@/components/landing/DemoWidget";
import NavAuthLinks from "@/components/landing/NavAuthLinks";
import { primaryButton, secondaryButton } from "@/components/landing/buttons";

const TITLE = "AI Front Desk – AI assistant for small business websites";
const DESCRIPTION =
  "An AI assistant for small businesses that answers customer questions from your own documents, captures leads and takes booking requests. Add it to any website with one line of code.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "AI Front Desk",
  },
};

// NEXT_PUBLIC_ values are inlined at build time.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com").replace(/\/+$/, "");
const DEMO_PUBLIC_KEY = process.env.NEXT_PUBLIC_DEMO_PUBLIC_KEY;
const GITHUB_URL = "https://github.com/Mamba09-bl/ai-front-desk";

const PATHS = {
  chat: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  moon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  trendingDown: "M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941",
  question:
    "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  refresh:
    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  grid: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  shield:
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  key: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  external: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
};

const PROBLEMS = [
  {
    icon: PATHS.chat,
    title: "The same questions all day",
    body: "Opening hours, prices, policies. Your staff answer them again and again.",
  },
  {
    icon: PATHS.moon,
    title: "Missed customers after hours",
    body: "People visit your website at night and on weekends. Nobody is there to reply.",
  },
  {
    icon: PATHS.trendingDown,
    title: "Lost leads",
    body: "Visitors leave without a name or number. You never hear from them again.",
  },
];

const FEATURES = [
  {
    icon: ICONS.documents,
    title: "Answers from your documents",
    body: "Replies come only from what you upload. It never invents prices, hours or policies.",
  },
  {
    icon: PATHS.refresh,
    title: "Understands follow-ups",
    body: "It keeps track of the conversation, so customers can ask follow-up questions.",
  },
  {
    icon: PATHS.question,
    title: "Honest when it doesn't know",
    body: "If the answer isn't in your documents, it says so and offers a callback instead.",
  },
  {
    icon: ICONS.leads,
    title: "Lead capture",
    body: "Collects a name and a phone number or email. Leads show up in your dashboard.",
  },
  {
    icon: ICONS.bookings,
    title: "Booking requests",
    body: "Confirms the details before saving and checks your opening hours. You approve each request in the dashboard.",
  },
  {
    icon: PATHS.code,
    title: "Works on any website",
    body: "Plain HTML, WordPress, anything. It's one script tag.",
  },
  {
    icon: PATHS.bolt,
    title: "Automations",
    body: "New bookings can trigger workflows, like an email to the owner through n8n.",
  },
  {
    icon: PATHS.grid,
    title: "Owner dashboard",
    body: "Your documents, leads and bookings in one place.",
  },
];

const SECURITY = [
  { icon: PATHS.lock, text: "Each business's data is fully separated." },
  { icon: PATHS.shield, text: "Rate limiting on the public chat API." },
  { icon: PATHS.key, text: "Secret keys are stored only as hashes." },
];

const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "PostgreSQL + pgvector",
  "Prisma",
  "Redis (Upstash)",
  "Groq LLM with tool calling",
  "n8n",
];

export default function Home() {
  const showDemo = Boolean(DEMO_PUBLIC_KEY);

  return (
    <div className="relative flex flex-1 flex-col bg-zinc-950 text-zinc-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:ring-2 focus:ring-violet-400"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Hero showDemo={showDemo} />
        <Problem />
        <HowItWorks />
        <Features />
        {DEMO_PUBLIC_KEY && <LiveDemo publicKey={DEMO_PUBLIC_KEY} />}
        <Security />
        <TechStack />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/30"
      >
        <Icon d={PATHS.chat} className="h-4.5 w-4.5" />
      </span>
      <span className="text-sm font-semibold sm:text-base">AI Front Desk</span>
    </Link>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <Suspense fallback={<div aria-hidden="true" className="h-9 w-44" />}>
            <NavAuthLinks />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}

function SectionHeading({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-base text-zinc-400">{intro}</p>}
    </div>
  );
}

function Hero({ showDemo }: { showDemo: boolean }) {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Ambient glow + grid, same treatment as the auth pages */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="mb-5 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-300">
          For clinics, auto repair shops, salons and schools
        </p>
        <h1 id="hero-heading" className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Never miss a customer again
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-zinc-400 sm:text-lg">
          An AI assistant that answers customer questions from your own documents, saves leads and takes booking
          requests. Add it to any website with one line of code.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/signup" className={`${primaryButton} h-11 px-6 text-sm`}>
            Get started
            <Icon d={PATHS.arrowRight} className="h-4 w-4" />
          </Link>
          {showDemo && (
            <DemoLink className={`${secondaryButton} h-11 px-6 text-sm`}>Try the live demo</DemoLink>
          )}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="border-t border-zinc-800/60 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="problem-heading"
          title="The problem"
          intro="Small businesses lose customers in the same few ways."
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((item) => (
            <li key={item.title} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6">
              <IconBadge d={item.icon} />
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function IconBadge({ d }: { d: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30">
      <Icon d={d} className="h-5 w-5" />
    </div>
  );
}

function ScriptSnippet() {
  return (
    <pre
      tabIndex={0}
      aria-label="Widget install snippet"
      className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs leading-relaxed text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <code>
        <span className="text-zinc-500">&lt;</span>
        <span className="text-violet-300">script</span> <span className="text-cyan-300">src</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&quot;{APP_URL}/widget.js&quot;</span>{" "}
        <span className="text-cyan-300">data-key</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&quot;pk_...&quot;</span>
        <span className="text-zinc-500">&gt;&lt;/</span>
        <span className="text-violet-300">script</span>
        <span className="text-zinc-500">&gt;</span>
      </code>
    </pre>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Upload your documents",
      body: "PDF price lists, FAQs and policies. The assistant answers from them.",
    },
    {
      title: "Paste one script tag into your website",
      body: "Add it before the closing </body> tag. Your public key is in your dashboard.",
      snippet: true,
    },
    {
      title: "The assistant gets to work",
      body: "It answers customers, saves leads and takes booking requests.",
    },
  ];

  return (
    <section aria-labelledby="how-heading" className="border-t border-zinc-800/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading id="how-heading" title="How it works" intro="Three steps from sign-up to a working assistant." />
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:gap-5 sm:p-6"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-violet-500/30"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-400">{step.body}</p>
                {step.snippet && <ScriptSnippet />}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section aria-labelledby="features-heading" className="border-t border-zinc-800/60 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="features-heading" title="Features" intro="What your assistant does, and what you control." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6">
              <IconBadge d={feature.icon} />
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LiveDemo({ publicKey }: { publicKey: string }) {
  return (
    <section
      id="demo"
      tabIndex={-1}
      aria-labelledby="demo-heading"
      className="scroll-mt-20 border-t border-zinc-800/60 py-20 focus:outline-none sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-b from-white/15 to-white/[0.03] p-px shadow-2xl shadow-violet-950/40">
          <div className="rounded-2xl bg-zinc-900/80 p-8 text-center backdrop-blur-xl sm:p-10">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/30">
              <Icon d={PATHS.chat} className="h-6 w-6" />
            </div>
            <h2 id="demo-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Try the live demo
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-300">
              The chat bubble in the bottom-right corner is a real assistant for a demo auto repair shop,{" "}
              <strong className="font-semibold text-white">Northgate Auto Care</strong>.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
              Ask about opening hours or prices, or book an appointment.
            </p>
          </div>
        </div>
      </div>
      <DemoWidget publicKey={publicKey} />
    </section>
  );
}

function Security() {
  return (
    <section aria-labelledby="security-heading" className="border-t border-zinc-800/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading id="security-heading" title="Built for security" />
        <ul className="space-y-3">
          {SECURITY.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-5 py-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
                <Icon d={item.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm text-zinc-200">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section aria-labelledby="stack-heading" className="border-t border-zinc-800/60 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="stack-heading" className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Tech stack
        </h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {TECH_STACK.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 font-mono text-xs text-zinc-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden border-t border-zinc-800/60 py-20 sm:py-28">
      <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Answer every customer, even after hours
        </h2>
        <p className="mt-4 text-base text-zinc-400">
          Upload your documents, add one script tag, and your assistant is live.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/signup" className={`${primaryButton} h-11 w-full px-6 text-sm sm:w-auto`}>
            Get started
            <Icon d={PATHS.arrowRight} className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Cached so reading the current date doesn't block prerendering (Cache Components).
async function CurrentYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:px-6">
        <p>
          AI Front Desk · <CurrentYear />
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md font-medium text-zinc-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          View on GitHub
          <Icon d={PATHS.external} className="h-4 w-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
