"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { Profile, ScanResult, ScheduleSlot, WorkoutPlan } from "@/lib/store/types";
import { newId } from "@/lib/id";
import { buildDefaultSchedule } from "@/lib/schedule";
import { PrimaryButton, SecondaryButton, Spinner, EmptyState } from "@/components/ui";
import PlanView from "./PlanView";
import ScheduleView from "./ScheduleView";

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [tab, setTab] = useState<"plan" | "schedule">("plan");
  const [note, setNote] = useState("");
  const [showRegenerate, setShowRegenerate] = useState(false);

  useEffect(() => {
    const store = getStore();
    Promise.all([store.getProfile(), store.latestPlan(), store.getSchedule(), store.listScans()]).then(
      ([p, pl, sc, scans]) => {
        setProfile(p);
        setPlan(pl);
        setSchedule(sc);
        setScan(scans[0] ?? null);
        setLoading(false);
      }
    );
  }, []);

  async function generate(regenerateNote?: string) {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile,
          priorities: scan?.topPriorities ?? null,
          regenerateNote,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't generate a plan.");
      }
      const data = await res.json();
      const newPlan: WorkoutPlan = {
        id: newId(),
        createdAt: new Date().toISOString(),
        daysPerWeek: profile.daysPerWeek,
        days: data.days,
        addressesPriorities: scan?.topPriorities ?? [],
        summary: data.summary,
      };
      await getStore().savePlan(newPlan);
      const newSchedule = buildDefaultSchedule(newPlan);
      await getStore().saveSchedule(newSchedule);
      setPlan(newPlan);
      setSchedule(newSchedule);
      setShowRegenerate(false);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function persistPlan(updated: WorkoutPlan) {
    setPlan(updated);
    await getStore().savePlan(updated);
  }

  async function persistSchedule(updated: ScheduleSlot[]) {
    setSchedule(updated);
    await getStore().saveSchedule(updated);
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
          description="We need your goal and equipment before building a plan."
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
    <div className="mx-auto max-w-2xl px-6 py-8 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Your plan</h1>
          {plan && (
            <p className="mt-1 text-[13px] text-text-tertiary">
              {plan.daysPerWeek} days a week
              {plan.addressesPriorities.length > 0 && " · built around your latest scan"}
            </p>
          )}
        </div>
        {plan && !generating && (
          <SecondaryButton onClick={() => setShowRegenerate((v) => !v)} className="!px-4 !py-2 text-[13px]">
            Regenerate
          </SecondaryButton>
        )}
      </div>

      {showRegenerate && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-4 sm:flex-row">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything to change? e.g. more back volume, swap a lift…"
            className="flex-1 rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-[13px] outline-none focus:border-navy-hi"
          />
          <PrimaryButton onClick={() => generate(note || undefined)} className="!px-5 !py-2 text-[13px]">
            Generate
          </PrimaryButton>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-danger">
          {error}
        </p>
      )}

      {generating && (
        <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
          <Spinner className="text-text-tertiary" />
          <p className="text-[13px] text-text-secondary">Building a plan around your profile…</p>
        </div>
      )}

      {!generating && !plan && (
        <div className="mt-8">
          <EmptyState
            title="No plan yet"
            description="Generate a weekly split built around your goal, experience, and equipment — and your scan priorities, if you have one."
            action={<PrimaryButton onClick={() => generate()}>Generate plan</PrimaryButton>}
          />
        </div>
      )}

      {!generating && plan && (
        <>
          <div className="mt-6 flex items-center gap-1">
            {(["plan", "schedule"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
                  tab === t ? "bg-surface-inverse text-text-inverse" : "text-text-secondary"
                }`}
              >
                {t === "plan" ? "Plan" : "Weekly schedule"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "plan" ? (
              <PlanView plan={plan} profile={profile} onChange={persistPlan} />
            ) : (
              <ScheduleView plan={plan} schedule={schedule} onChange={persistSchedule} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
