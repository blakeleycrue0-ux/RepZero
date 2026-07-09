"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { ChatMessage, NutritionPlan, Profile } from "@/lib/store/types";
import { newId } from "@/lib/id";
import { PrimaryButton, SecondaryButton, Spinner, Card, EmptyState, Tag } from "@/components/ui";
import Chat from "@/components/Chat";

const SUGGESTIONS = [
  "Can I swap the breakfast for something quicker?",
  "What can I eat instead if I don't like fish?",
  "Is this enough protein for my goal?",
];

export default function NutritionPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState<"guidance" | "chat">("guidance");

  useEffect(() => {
    const store = getStore();
    Promise.all([store.getProfile(), store.listNutritionPlans(), store.getNutritionThread()]).then(
      ([p, plans, t]) => {
        setProfile(p);
        setPlan(plans[0] ?? null);
        setThread(t);
        setLoading(false);
      }
    );
  }, []);

  async function generate() {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't generate guidance.");
      }
      const data = await res.json();
      const newPlan: NutritionPlan = {
        id: newId(),
        createdAt: new Date().toISOString(),
        targetCalories: data.targetCalories,
        maintenanceCalories: data.maintenanceCalories,
        calorieStrategy: data.calorieStrategy,
        macros: data.macros,
        meals: data.meals,
        notes: data.notes,
      };
      await getStore().saveNutritionPlan(newPlan);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyState
          title="Finish onboarding first"
          description="We need your goal and dietary pattern before building guidance."
          action={
            <Link href="/onboarding">
              <PrimaryButton>Go to onboarding</PrimaryButton>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-[80dvh] max-w-2xl flex-col px-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Nutrition</h1>
      </div>

      <div className="mt-6 flex items-center gap-1">
        {(["guidance", "chat"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              tab === t ? "bg-surface-inverse text-text-inverse" : "text-text-secondary"
            }`}
          >
            {t === "guidance" ? "Guidance" : "Swap chat"}
          </button>
        ))}
      </div>

      {tab === "guidance" ? (
        <div className="mt-6 flex-1">
          {error && (
            <p role="alert" className="mb-4 text-[13px] text-danger">
              {error}
            </p>
          )}
          {generating ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Spinner className="text-text-tertiary" />
              <p className="text-[13px] text-text-secondary">Building balanced guidance for your goal…</p>
            </div>
          ) : !plan ? (
            <EmptyState
              title="No guidance yet"
              description="Generate a day of balanced meal guidance aligned to your goal and dietary pattern."
              action={<PrimaryButton onClick={generate}>Generate guidance</PrimaryButton>}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-6">
                  <Stat label="Calories" value={plan.targetCalories} />
                  <Stat label="Protein" value={`${plan.macros.protein}g`} />
                  <Stat label="Carbs" value={`${plan.macros.carbs}g`} />
                  <Stat label="Fat" value={`${plan.macros.fat}g`} />
                </div>
                <SecondaryButton onClick={generate} className="!px-4 !py-1.5 text-[13px]">
                  Regenerate
                </SecondaryButton>
              </div>

              {plan.calorieStrategy && (
                <div className="mt-3 flex items-center gap-2">
                  <Tag
                    tone={
                      plan.calorieStrategy === "deficit"
                        ? "developing"
                        : plan.calorieStrategy === "surplus"
                          ? "solid"
                          : "neutral"
                    }
                  >
                    {plan.calorieStrategy === "deficit"
                      ? "Calorie deficit"
                      : plan.calorieStrategy === "surplus"
                        ? "Calorie surplus"
                        : "Maintenance"}
                  </Tag>
                  {plan.maintenanceCalories > 0 && (
                    <span className="text-[12px] text-text-tertiary">
                      ~{plan.maintenanceCalories} cal estimated maintenance
                    </span>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                {plan.meals.map((meal, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-lg">{meal.name}</p>
                      {meal.calories > 0 && (
                        <span className="shrink-0 text-[12px] tabular-nums text-text-tertiary">
                          {meal.calories} cal
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-text-secondary">{meal.description}</p>
                    <ul className="mt-3 flex flex-col gap-1">
                      {meal.items.map((item, j) => (
                        <li key={j} className="text-[13px] text-text-secondary before:mr-2 before:content-['—']">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              <p className="mt-6 text-[12px] leading-relaxed text-text-tertiary">
                {plan.notes} This is general guidance, not medical or dietetic advice — consult a professional
                for individual needs.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 flex-1">
          <Chat
            initialMessages={thread}
            endpoint="/api/nutrition-chat"
            buildBody={(messages) => ({ profile, planNotes: plan?.notes ?? null, messages })}
            onPersist={(messages) => {
              setThread(messages);
              getStore().saveNutritionThread(messages);
            }}
            emptyTitle="Ask about swaps or portions"
            emptyDescription="Practical, sustainable answers — never a crash diet."
            suggestions={SUGGESTIONS}
            placeholder="Ask about a swap or portion…"
            disclaimer="General guidance, not medical or dietetic advice. If something here doesn't feel right for you, a registered dietitian can help."
          />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="font-display text-xl tabular-nums">{value}</p>
    </div>
  );
}
