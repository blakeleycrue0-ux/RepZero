"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStore } from "@/lib/store";
import type {
  Habit,
  HabitLog,
  ScanResult,
  ScheduleSlot,
  WorkoutPlan,
  Profile,
  WaterLog,
  NutritionPlan,
} from "@/lib/store/types";
import { todayKey } from "@/lib/id";
import { tipOfTheDay } from "@/lib/tips";
import { MUSCLE_LABELS, RATING_TAG_TONE } from "@/lib/muscle-labels";
import { Card, EmptyState, Tag, PrimaryButton, Spinner } from "@/components/ui";
import { IconCheck, IconCoach, IconFlame, IconNutrition } from "@/components/icons";
import WaterTracker from "@/components/WaterTracker";
import { CUP_ML } from "@/lib/water";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);

  const load = useCallback(async () => {
    const store = getStore();
    const [p, pl, sc, hs, lg, scans, wl, nps] = await Promise.all([
      store.getProfile(),
      store.latestPlan(),
      store.getSchedule(),
      store.listHabits(),
      store.listHabitLogs(),
      store.listScans(),
      store.listWaterLogs(),
      store.listNutritionPlans(),
    ]);
    setProfile(p);
    setPlan(pl);
    setSchedule(sc);
    setHabits(hs.filter((h) => !h.archived));
    setLogs(lg);
    setScan(scans[0] ?? null);
    setWaterLogs(wl);
    setNutritionPlan(nps[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial load from IndexedDB — an external system with no render-time
    // equivalent, so syncing it into state here is the intended pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().then(() => {
      getStore()
        .getProfile()
        .then((p) => {
          if (!p) router.replace("/onboarding");
        });
    });
  }, [load, router]);

  async function toggleHabit(habitId: string) {
    const date = todayKey();
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    const next: HabitLog = { habitId, date, done: !existing?.done };
    await getStore().setHabitLog(next);
    setLogs((prev) => {
      const rest = prev.filter((l) => !(l.habitId === habitId && l.date === date));
      return [...rest, next];
    });
  }

  async function setWaterCups(cups: number) {
    const date = todayKey();
    const ml = Math.max(0, cups) * CUP_ML;
    const next: WaterLog = { date, ml };
    await getStore().setWaterLog(next);
    setWaterLogs((prev) => [...prev.filter((l) => l.date !== date), next]);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const todaySlot = schedule.find((s) => s.dayIndex === todayIndex);
  const todayPlanDay =
    todaySlot?.planDayIndex != null && plan ? plan.days[todaySlot.planDayIndex] : null;

  const hour = today.getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const doneToday = logs.filter((l) => l.date === todayKey() && l.done).length;
  const todayMeals = nutritionPlan?.days[todayIndex]?.meals ?? null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-12">
      <p className="text-[13px] text-text-tertiary">
        {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-1 font-display text-3xl md:text-4xl">
        {greeting}{profile?.displayName ? `, ${profile.displayName}` : ""}.
      </h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
            Next session
          </h2>
          {todayPlanDay && !todayPlanDay.isRest ? (
            <div className="mt-3">
              <p className="font-display text-2xl">{todayPlanDay.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {todayPlanDay.focus.map((f) => (
                  <Tag key={f}>{MUSCLE_LABELS[f]}</Tag>
                ))}
              </div>
              {todaySlot?.time && (
                <p className="mt-3 text-[13px] text-text-secondary">Scheduled for {todaySlot.time}</p>
              )}
              <Link
                href="/plan"
                className="mt-4 inline-block text-[13px] font-medium text-navy-hi underline underline-offset-4"
              >
                View full session
              </Link>
            </div>
          ) : plan ? (
            <div className="mt-3">
              <p className="font-display text-2xl">Rest day</p>
              <p className="mt-2 text-[13px] text-text-secondary">
                No training scheduled today. Recovery counts too.
              </p>
              <Link href="/plan" className="mt-4 inline-block text-[13px] font-medium text-navy-hi underline underline-offset-4">
                View weekly schedule
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[14px] text-text-secondary">
                You don’t have a plan yet. Generate one from your profile — or scan first for a
                plan built around what needs the most work.
              </p>
              <div className="mt-4 flex gap-3">
                <Link href="/plan">
                  <PrimaryButton>Generate plan</PrimaryButton>
                </Link>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
            Coach tip
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed">{tipOfTheDay()}</p>
          <Link
            href="/coach"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-hi"
          >
            <IconCoach width={14} height={14} /> Ask a follow-up
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
              Habits due today
            </h2>
            {habits.length > 0 && (
              <span className="flex items-center gap-1 text-[12px] tabular-nums text-text-tertiary">
                <IconFlame width={13} height={13} /> {doneToday}/{habits.length}
              </span>
            )}
          </div>
          {habits.length === 0 ? (
            <EmptyState
              title="No habits yet"
              description="Track training, steps, water, sleep — whatever keeps you consistent."
              action={
                <Link href="/habits">
                  <PrimaryButton className="mt-1">Set up habits</PrimaryButton>
                </Link>
              }
            />
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border-subtle">
              {habits.map((h) => {
                const done = logs.some((l) => l.habitId === h.id && l.date === todayKey() && l.done);
                return (
                  <li key={h.id} className="flex items-center justify-between py-2.5">
                    <span className="text-[14px]">{h.icon} {h.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleHabit(h.id)}
                      aria-pressed={done}
                      aria-label={`Mark ${h.name} ${done ? "not done" : "done"}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                        done ? "border-strong bg-strong/15 text-strong" : "border-border-strong text-transparent"
                      }`}
                    >
                      <IconCheck width={14} height={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
            Latest scan
          </h2>
          {scan ? (
            <div className="mt-3">
              <p className="text-[13px] leading-relaxed text-text-secondary">{scan.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {scan.topPriorities.map((p) => (
                  <Tag key={p} tone={RATING_TAG_TONE.developing}>
                    {MUSCLE_LABELS[p]}
                  </Tag>
                ))}
              </div>
              <Link href="/scan" className="mt-4 inline-block text-[13px] font-medium text-navy-hi underline underline-offset-4">
                View muscle map
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Scan once to see where to focus first.
              </p>
              <Link href="/scan">
                <PrimaryButton className="mt-4 w-full">Start scan</PrimaryButton>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
            Eat today
          </h2>
          {todayMeals ? (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {todayMeals.map((m) => (
                  <Tag key={m.name}>{m.name}</Tag>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-text-secondary">
                {nutritionPlan?.targetCalories} cal target today
              </p>
              <Link
                href="/nutrition"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-hi underline underline-offset-4"
              >
                <IconNutrition width={14} height={14} /> View today&rsquo;s meals
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Generate a week of nutrition guidance built around your goal.
              </p>
              <Link href="/nutrition">
                <PrimaryButton className="mt-4 w-full">Generate guidance</PrimaryButton>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">Water</h2>
          <div className="mt-3">
            <WaterTracker
              totalMl={waterLogs.find((l) => l.date === todayKey())?.ml ?? 0}
              onSetCups={setWaterCups}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
