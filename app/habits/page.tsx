"use client";

import { useEffect, useMemo, useState } from "react";
import { getStore } from "@/lib/store";
import type { Habit, HabitLog } from "@/lib/store/types";
import { newId, todayKey } from "@/lib/id";
import {
  currentStreak,
  weeklyCompletionRate,
  monthCompletionMap,
  HABIT_ICON_PRESETS,
} from "@/lib/habits";
import { Card, PrimaryButton, SecondaryButton, EmptyState, Spinner } from "@/components/ui";
import { IconCheck, IconFlame, IconClose } from "@/components/icons";

export default function HabitsPage() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(HABIT_ICON_PRESETS[0]);

  useEffect(() => {
    const store = getStore();
    Promise.all([store.listHabits(), store.listHabitLogs()]).then(([h, l]) => {
      setHabits(h.filter((x) => !x.archived));
      setLogs(l);
      setLoading(false);
    });
  }, []);

  async function toggle(habitId: string) {
    const date = todayKey();
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    const next: HabitLog = { habitId, date, done: !existing?.done };
    await getStore().setHabitLog(next);
    setLogs((prev) => [...prev.filter((l) => !(l.habitId === habitId && l.date === date)), next]);
  }

  async function addHabit() {
    if (!name.trim()) return;
    const habit: Habit = { id: newId(), name: name.trim(), icon, createdAt: new Date().toISOString(), archived: false };
    await getStore().saveHabit(habit);
    setHabits((prev) => [...prev, habit]);
    setName("");
    setIcon(HABIT_ICON_PRESETS[0]);
    setAdding(false);
  }

  async function archive(habitId: string) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const updated = { ...habit, archived: true };
    await getStore().saveHabit(updated);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }

  const today = todayKey();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Habits</h1>
        {!adding && (
          <SecondaryButton onClick={() => setAdding(true)} className="!px-4 !py-1.5 text-[13px]">
            + Add habit
          </SecondaryButton>
        )}
      </div>

      {adding && (
        <Card className="mt-5 p-4">
          <div className="flex flex-wrap gap-1.5">
            {HABIT_ICON_PRESETS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                aria-pressed={icon === i}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-[16px] ${
                  icon === i ? "border-navy-hi bg-navy-hi/10" : "border-border-subtle"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink water, 8k steps, sleep by 11"
              className="flex-1 rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-[13px] outline-none focus:border-navy-hi"
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
            <PrimaryButton onClick={addHabit} className="!px-4 !py-2 text-[13px]">
              Add
            </PrimaryButton>
            <SecondaryButton onClick={() => setAdding(false)} className="!px-3 !py-2 text-[13px]">
              Cancel
            </SecondaryButton>
          </div>
        </Card>
      )}

      {habits.length === 0 && !adding ? (
        <div className="mt-8">
          <EmptyState
            title="No habits yet"
            description="Track training, steps, water, sleep — whatever keeps you consistent."
            action={<PrimaryButton onClick={() => setAdding(true)}>Add your first habit</PrimaryButton>}
          />
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-2">
            {habits.map((h) => {
              const done = logs.some((l) => l.habitId === h.id && l.date === today && l.done);
              const streak = currentStreak(logs, h.id);
              return (
                <Card key={h.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-[18px]">{h.icon}</span>
                  <span className="flex-1 text-[14px]">{h.name}</span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-[12px] tabular-nums text-developing">
                      <IconFlame width={13} height={13} /> {streak}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggle(h.id)}
                    aria-pressed={done}
                    aria-label={`Mark ${h.name} ${done ? "not done" : "done"}`}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                      done ? "border-strong bg-strong/15 text-strong" : "border-border-strong text-transparent"
                    }`}
                  >
                    <IconCheck width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => archive(h.id)}
                    aria-label={`Remove ${h.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:text-danger"
                  >
                    <IconClose width={13} height={13} />
                  </button>
                </Card>
              );
            })}
          </div>

          <MonthHeatmap habits={habits} logs={logs} />
          <WeeklyReview habits={habits} logs={logs} />
        </>
      )}
    </div>
  );
}

function MonthHeatmap({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const map = useMemo(() => monthCompletionMap(habits, logs, year, month), [habits, logs, year, month]);

  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <Card className="mt-6 p-5">
      <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
        {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </h2>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-center text-[10px] text-text-tertiary">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const ratio = map[todayKey(date)] ?? 0;
          const isFuture = date > now;
          return (
            <div
              key={i}
              title={`${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${Math.round(ratio * 100)}%`}
              className="aspect-square rounded-md"
              style={{
                background: isFuture ? "var(--surface-2)" : `color-mix(in srgb, var(--color-strong) ${Math.round(ratio * 100)}%, var(--surface-2))`,
              }}
            />
          );
        })}
      </div>
    </Card>
  );
}

function WeeklyReview({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  return (
    <Card className="mt-4 p-5">
      <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">Last 7 days</h2>
      <div className="mt-3 flex flex-col gap-3">
        {habits.map((h) => {
          const rate = weeklyCompletionRate(logs, h.id);
          return (
            <div key={h.id}>
              <div className="flex items-center justify-between text-[13px]">
                <span>{h.icon} {h.name}</span>
                <span className="tabular-nums text-text-tertiary">{Math.round(rate * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-navy-hi" style={{ width: `${rate * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
