import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import ThemeToggle from "@/components/ThemeToggle";
import LandingRedirect from "@/components/LandingRedirect";
import Logo from "@/components/Logo";
import { IconCheck } from "@/components/icons";
import { supabaseEnabled } from "@/lib/supabase/config";

const startHref = supabaseEnabled ? "/login" : "/onboarding";

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
};

const PILLARS = [
  {
    n: "01",
    title: "A scan, not a scale.",
    body: "Three photos, ten muscle groups, an honest read on what's developing, solid, and strong — never a number that shames you.",
  },
  {
    n: "02",
    title: "A plan that targets it.",
    body: "Your split is built around what the scan found, not a generic template. Regenerate it any time your goal shifts.",
  },
  {
    n: "03",
    title: "A coach who remembers.",
    body: "Ask about swaps, soreness, or whether you're overdoing cardio — the coach already knows your plan and your goals.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface-0 text-text-primary">
      <LandingRedirect />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Logo size={24} />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={startHref}
            className="rounded-full border border-border-strong px-4 py-1.5 text-[13px] font-medium transition-colors hover:border-text-primary"
          >
            Start
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:px-10 md:pb-28 md:pt-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-6">
          <h1 className="font-display text-[13vw] leading-[0.95] tracking-tight md:text-[5.2vw]">
            An honest look at
            <br />
            your training —
            <br />
            <span className="text-navy dark:text-navy-hi">and what to build next.</span>
          </h1>
          <div className="flex flex-col gap-6 md:pb-2">
            <p className="max-w-sm text-[15px] leading-relaxed text-text-secondary">
              {brand.name} reads your physique per muscle group, then builds the workout
              plan, weekly schedule, and nutrition guidance to match. No shame scale.
              No red flags. Just developing, solid, strong.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={startHref}
                className="rounded-full bg-surface-inverse px-6 py-3 text-[14px] font-medium text-text-inverse transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start your scan
              </Link>
              <Link
                href="/legal/how-ai-works"
                className="text-[13px] font-medium text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-text-primary"
              >
                How the AI works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface-1">
        <div className="mx-auto grid max-w-6xl gap-px bg-border-subtle md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="bg-surface-1 px-6 py-10 md:px-8 md:py-14">
              <span className="font-display text-sm text-text-tertiary">{p.n}</span>
              <h2 className="mt-4 font-display text-2xl leading-tight">{p.title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h3 className="font-display text-3xl leading-tight md:text-4xl">
              Your photos are analyzed and instantly discarded.
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-secondary">
              We never store or view your images. They’re processed in memory to generate
              your muscle-group ratings, then the buffer is discarded the moment the
              analysis returns — nothing touches a disk, nothing goes to a database.
            </p>
            <Link
              href="/legal/privacy"
              className="mt-4 inline-block text-[13px] font-medium text-navy-hi underline underline-offset-4"
            >
              Read the privacy policy
            </Link>
          </div>
          <ul className="flex flex-col gap-4">
            {[
              supabaseEnabled
                ? "One free account — no password, just an email link."
                : "Local-first: usable with zero account, zero setup.",
              "developing / solid / strong — never a red flag.",
              "One AI coach, personalized to your plan and profile.",
              "Nutrition guidance that stays sustainable, never restrictive.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-[14px] text-text-secondary">
                <IconCheck className="mt-0.5 shrink-0 text-strong" width={16} height={16} />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-border-subtle px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-[13px] text-text-tertiary md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}. A visual estimate for motivation, not medical advice.</span>
          <div className="flex gap-5">
            <Link href="/legal/privacy" className="hover:text-text-primary">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-text-primary">Terms</Link>
            <Link href="/legal/how-ai-works" className="hover:text-text-primary">How the AI works</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
