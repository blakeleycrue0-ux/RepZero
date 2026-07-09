"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { DietPattern, Equipment, Experience, Goal, Profile } from "@/lib/store/types";
import { PrimaryButton, SecondaryButton, ChoiceCard } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";
import { brand } from "@/lib/brand";

const GOALS: { value: Goal; title: string; description: string }[] = [
  { value: "build_muscle", title: "Build muscle", description: "Add size and strength across the board." },
  { value: "lose_fat", title: "Lose fat", description: "Lean out while holding onto strength." },
  { value: "recomposition", title: "Recomposition", description: "Build muscle and lose fat at the same time." },
  { value: "general_health", title: "General health", description: "Move well, feel strong, stay consistent." },
];

const EXPERIENCE: { value: Experience; title: string; description: string }[] = [
  { value: "beginner", title: "Beginner", description: "New to structured training, or under 6 months in." },
  { value: "intermediate", title: "Intermediate", description: "Training consistently for 6 months to a few years." },
  { value: "advanced", title: "Advanced", description: "Years of consistent training, comfortable programming." },
];

const EQUIPMENT: { value: Equipment; title: string; description: string }[] = [
  { value: "full_gym", title: "Full gym", description: "Barbells, racks, machines, the works." },
  { value: "home", title: "Home setup", description: "Dumbbells, bands, maybe a bench." },
  { value: "minimal", title: "Minimal / bodyweight", description: "Little to no equipment." },
];

const DIETS: { value: DietPattern; title: string }[] = [
  { value: "omnivore", title: "Omnivore" },
  { value: "vegetarian", title: "Vegetarian" },
  { value: "vegan", title: "Vegan" },
  { value: "pescatarian", title: "Pescatarian" },
  { value: "halal", title: "Halal" },
  { value: "kosher", title: "Kosher" },
  { value: "other", title: "Other" },
];

type Draft = {
  goal: Goal | null;
  experience: Experience | null;
  daysPerWeek: number;
  equipment: Equipment | null;
  dietPattern: DietPattern | null;
  allergies: string;
  ageConfirmed: boolean;
};

const STEPS = ["goal", "experience", "days", "equipment", "diet", "confirm"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    goal: null,
    experience: null,
    daysPerWeek: 4,
    equipment: null,
    dietPattern: null,
    allergies: "",
    ageConfirmed: false,
  });

  const stepKey = STEPS[step];

  const canAdvance = useMemo(() => {
    switch (stepKey) {
      case "goal":
        return !!draft.goal;
      case "experience":
        return !!draft.experience;
      case "days":
        return draft.daysPerWeek >= 1 && draft.daysPerWeek <= 7;
      case "equipment":
        return !!draft.equipment;
      case "diet":
        return !!draft.dietPattern;
      case "confirm":
        return draft.ageConfirmed;
      default:
        return false;
    }
  }, [draft, stepKey]);

  async function finish() {
    if (!draft.goal || !draft.experience || !draft.equipment || !draft.dietPattern) return;
    setSaving(true);
    const now = new Date().toISOString();
    const profile: Profile = {
      goal: draft.goal,
      experience: draft.experience,
      daysPerWeek: draft.daysPerWeek,
      equipment: draft.equipment,
      dietPattern: draft.dietPattern,
      allergies: draft.allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      ageConfirmed: draft.ageConfirmed,
      createdAt: now,
      updatedAt: now,
    };
    await getStore().saveProfile(profile);
    router.push("/home?onboarded=1");
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary hover:border-border-strong"
          >
            <IconArrowLeft width={16} height={16} />
          </button>
        ) : (
          <Link href="/" className="font-display text-base tracking-tight">
            {brand.name}
          </Link>
        )}
        <span className="text-[12px] tabular-nums text-text-tertiary">
          {step + 1} / {STEPS.length}
        </span>
      </div>

      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-navy-hi transition-all duration-300 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1">
        {stepKey === "goal" && (
          <StepShell title="What's the goal?" description="This shapes your plan, your schedule, and your nutrition guidance.">
            <div className="flex flex-col gap-3">
              {GOALS.map((g) => (
                <ChoiceCard
                  key={g.value}
                  title={g.title}
                  description={g.description}
                  selected={draft.goal === g.value}
                  onClick={() => setDraft((d) => ({ ...d, goal: g.value }))}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepKey === "experience" && (
          <StepShell title="How experienced are you?" description="We'll calibrate volume and complexity to match.">
            <div className="flex flex-col gap-3">
              {EXPERIENCE.map((e) => (
                <ChoiceCard
                  key={e.value}
                  title={e.title}
                  description={e.description}
                  selected={draft.experience === e.value}
                  onClick={() => setDraft((d) => ({ ...d, experience: e.value }))}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepKey === "days" && (
          <StepShell title="Training days per week" description="You can always adjust this later from your plan.">
            <div className="flex items-center justify-center gap-6 py-8">
              <button
                type="button"
                aria-label="Fewer days"
                onClick={() => setDraft((d) => ({ ...d, daysPerWeek: Math.max(1, d.daysPerWeek - 1) }))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-xl"
              >
                –
              </button>
              <span className="font-display text-6xl tabular-nums">{draft.daysPerWeek}</span>
              <button
                type="button"
                aria-label="More days"
                onClick={() => setDraft((d) => ({ ...d, daysPerWeek: Math.min(7, d.daysPerWeek + 1) }))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-xl"
              >
                +
              </button>
            </div>
            <p className="text-center text-[13px] text-text-tertiary">days per week</p>
          </StepShell>
        )}

        {stepKey === "equipment" && (
          <StepShell title="What do you have access to?" description="We'll only program what you can actually do.">
            <div className="flex flex-col gap-3">
              {EQUIPMENT.map((e) => (
                <ChoiceCard
                  key={e.value}
                  title={e.title}
                  description={e.description}
                  selected={draft.equipment === e.value}
                  onClick={() => setDraft((d) => ({ ...d, equipment: e.value }))}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepKey === "diet" && (
          <StepShell title="Dietary pattern" description="And any allergies or foods we should avoid suggesting.">
            <div className="mb-5 grid grid-cols-2 gap-3">
              {DIETS.map((d) => (
                <ChoiceCard
                  key={d.value}
                  title={d.title}
                  selected={draft.dietPattern === d.value}
                  onClick={() => setDraft((s) => ({ ...s, dietPattern: d.value }))}
                />
              ))}
            </div>
            <label className="block text-[13px] font-medium text-text-secondary" htmlFor="allergies">
              Allergies or foods to avoid (optional)
            </label>
            <input
              id="allergies"
              type="text"
              value={draft.allergies}
              onChange={(e) => setDraft((d) => ({ ...d, allergies: e.target.value }))}
              placeholder="e.g. peanuts, shellfish, dairy"
              className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
            />
          </StepShell>
        )}

        {stepKey === "confirm" && (
          <StepShell
            title="Last thing."
            description={`${brand.name} analyzes photos of your body and generates nutrition guidance, so we need to confirm you're an adult before continuing.`}
          >
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, ageConfirmed: !d.ageConfirmed }))}
              aria-pressed={draft.ageConfirmed}
              className={`flex w-full items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                draft.ageConfirmed ? "border-navy-hi bg-navy-hi/[0.06] dark:bg-navy-hi/[0.12]" : "border-border-subtle"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  draft.ageConfirmed ? "border-navy-hi bg-navy-hi" : "border-border-strong"
                }`}
              >
                {draft.ageConfirmed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M4.5 12.5 9 17l10.5-11" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[14px] leading-relaxed">
                I confirm I am 18 years of age or older, and I understand {brand.name}&rsquo;s
                body scan and nutrition guidance are informational estimates, not medical advice.
              </span>
            </button>
            <p className="mt-4 text-[12px] leading-relaxed text-text-tertiary">
              Your photos, if you choose to scan, are analyzed in memory and never stored. Read the{" "}
              <Link href="/legal/privacy" className="underline underline-offset-2">privacy policy</Link>.
            </p>
          </StepShell>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <SecondaryButton onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </SecondaryButton>
        )}
        <PrimaryButton onClick={next} disabled={!canAdvance || saving} className="flex-1">
          {saving ? "Saving…" : step === STEPS.length - 1 ? `Enter ${brand.name}` : "Continue"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl leading-tight">{title}</h1>
      <p className="mt-2 mb-7 text-[14px] leading-relaxed text-text-secondary">{description}</p>
      {children}
    </div>
  );
}
