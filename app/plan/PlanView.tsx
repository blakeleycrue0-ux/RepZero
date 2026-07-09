"use client";

import { useState } from "react";
import type { PlanExercise, WorkoutPlan } from "@/lib/store/types";
import { MUSCLE_LABELS } from "@/lib/muscle-labels";
import { Card, Tag, SecondaryButton } from "@/components/ui";
import { IconClose } from "@/components/icons";

export default function PlanView({
  plan,
  onChange,
}: {
  plan: WorkoutPlan;
  onChange: (plan: WorkoutPlan) => void;
}) {
  const [openDay, setOpenDay] = useState<number>(0);

  function updateDay(dayIdx: number, exercises: PlanExercise[]) {
    const days = plan.days.map((d, i) => (i === dayIdx ? { ...d, exercises } : d));
    onChange({ ...plan, days });
  }

  function updateExercise(dayIdx: number, exIdx: number, patch: Partial<PlanExercise>) {
    const day = plan.days[dayIdx];
    const exercises = day.exercises.map((e, i) => (i === exIdx ? { ...e, ...patch } : e));
    updateDay(dayIdx, exercises);
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    const day = plan.days[dayIdx];
    updateDay(dayIdx, day.exercises.filter((_, i) => i !== exIdx));
  }

  function addExercise(dayIdx: number) {
    const day = plan.days[dayIdx];
    updateDay(dayIdx, [
      ...day.exercises,
      { name: "New exercise", sets: 3, reps: "8-10", rpe: "8", targets: day.focus.slice(0, 1) },
    ]);
  }

  return (
    <div>
      <p className="mb-5 text-[14px] leading-relaxed text-text-secondary">{plan.summary}</p>
      <div className="flex flex-col gap-3">
        {plan.days.map((day, dayIdx) => {
          const open = openDay === dayIdx;
          return (
            <Card key={dayIdx} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDay(open ? -1 : dayIdx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                aria-expanded={open}
              >
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{day.day}</p>
                  <p className="font-display text-xl">{day.name}</p>
                  {!day.isRest && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {day.focus.map((f) => (
                        <Tag key={f}>{MUSCLE_LABELS[f]}</Tag>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[13px] text-text-tertiary">{open ? "Hide" : "Show"}</span>
              </button>

              {open && !day.isRest && (
                <div className="border-t border-border-subtle px-5 py-4">
                  <div className="hidden grid-cols-[1fr_56px_72px_56px_28px] gap-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary sm:grid">
                    <span>Exercise</span>
                    <span>Sets</span>
                    <span>Reps</span>
                    <span>RPE</span>
                    <span />
                  </div>
                  <div className="flex flex-col gap-2">
                    {day.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="grid grid-cols-2 gap-2 rounded-xl border border-border-subtle p-2.5 sm:grid-cols-[1fr_56px_72px_56px_28px] sm:items-center sm:border-none sm:p-0"
                      >
                        <input
                          value={ex.name}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { name: e.target.value })}
                          className="col-span-2 rounded-lg border border-border-subtle bg-surface-0 px-2.5 py-1.5 text-[13px] outline-none focus:border-navy-hi sm:col-span-1"
                        />
                        <input
                          type="number"
                          min={1}
                          value={ex.sets}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { sets: Number(e.target.value) })}
                          className="rounded-lg border border-border-subtle bg-surface-0 px-2 py-1.5 text-[13px] outline-none focus:border-navy-hi"
                          aria-label="Sets"
                        />
                        <input
                          value={ex.reps}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                          className="rounded-lg border border-border-subtle bg-surface-0 px-2 py-1.5 text-[13px] outline-none focus:border-navy-hi"
                          aria-label="Reps"
                        />
                        <input
                          value={ex.rpe}
                          onChange={(e) => updateExercise(dayIdx, exIdx, { rpe: e.target.value })}
                          className="rounded-lg border border-border-subtle bg-surface-0 px-2 py-1.5 text-[13px] outline-none focus:border-navy-hi"
                          aria-label="RPE"
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(dayIdx, exIdx)}
                          aria-label={`Remove ${ex.name}`}
                          className="flex h-7 w-7 items-center justify-center justify-self-end rounded-full text-text-tertiary hover:text-danger sm:justify-self-auto"
                        >
                          <IconClose width={13} height={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <SecondaryButton onClick={() => addExercise(dayIdx)} className="mt-3 !px-4 !py-1.5 text-[13px]">
                    + Add exercise
                  </SecondaryButton>
                </div>
              )}

              {open && day.isRest && (
                <div className="border-t border-border-subtle px-5 py-4 text-[13px] text-text-secondary">
                  Rest day. Recovery is part of the plan, not a gap in it.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
