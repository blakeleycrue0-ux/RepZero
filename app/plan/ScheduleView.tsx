"use client";

import { useEffect, useRef, useState } from "react";
import type { ScheduleSlot, WorkoutPlan } from "@/lib/store/types";
import { WEEKDAY_NAMES } from "@/lib/schedule";
import { Card, SecondaryButton } from "@/components/ui";
import { IconBell, IconCheck } from "@/components/icons";
import { generateSchedureIcs, downloadIcs } from "@/lib/ics";
import {
  notificationsSupported,
  requestNotificationPermission,
  scheduleUpcomingReminders,
} from "@/lib/notifications";
import { brand } from "@/lib/brand";

export default function ScheduleView({
  plan,
  schedule,
  onChange,
}: {
  plan: WorkoutPlan;
  schedule: ScheduleSlot[];
  onChange: (schedule: ScheduleSlot[]) => void;
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const dragging = useRef<number | null>(null);
  const [remindersOn, setRemindersOn] = useState(false);

  useEffect(() => {
    if (notificationsSupported() && Notification.permission === "granted") {
      setRemindersOn(true);
      scheduleUpcomingReminders(schedule, plan);
    }
  }, [schedule, plan]);

  async function enableReminders() {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      setRemindersOn(true);
      scheduleUpcomingReminders(schedule, plan);
    }
  }

  function swap(a: number, b: number) {
    if (a === b) return;
    const next = schedule.map((s) => ({ ...s }));
    const slotA = next.find((s) => s.dayIndex === a)!;
    const slotB = next.find((s) => s.dayIndex === b)!;
    const tmp = { planDayIndex: slotA.planDayIndex, time: slotA.time, reminderEnabled: slotA.reminderEnabled };
    slotA.planDayIndex = slotB.planDayIndex;
    slotA.time = slotB.time;
    slotA.reminderEnabled = slotB.reminderEnabled;
    slotB.planDayIndex = tmp.planDayIndex;
    slotB.time = tmp.time;
    slotB.reminderEnabled = tmp.reminderEnabled;
    onChange(next);
  }

  function updateSlot(dayIndex: number, patch: Partial<ScheduleSlot>) {
    onChange(schedule.map((s) => (s.dayIndex === dayIndex ? { ...s, ...patch } : s)));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {notificationsSupported() && (
          <SecondaryButton
            onClick={enableReminders}
            disabled={remindersOn}
            className="!px-3.5 !py-1.5 text-[12px]"
          >
            {remindersOn ? (
              <>
                <IconCheck width={13} height={13} /> Reminders on
              </>
            ) : (
              <>
                <IconBell width={13} height={13} /> Enable reminders
              </>
            )}
          </SecondaryButton>
        )}
        <SecondaryButton
          onClick={() => downloadIcs(generateSchedureIcs(schedule, plan), `${brand.short.toLowerCase()}-schedule.ics`)}
          className="!px-3.5 !py-1.5 text-[12px]"
        >
          Add to calendar
        </SecondaryButton>
      </div>
      <p className="mb-4 text-[12px] text-text-tertiary">
        Reminders fire while {brand.name} is open in a tab or installed. For a guaranteed alert
        regardless, add sessions to your calendar.
      </p>
      <p className="mb-4 text-[13px] text-text-secondary">
        Drag a session onto another day to move it — the time and reminder move with it.
      </p>
      <div className="flex flex-col gap-2">
        {WEEKDAY_NAMES.map((name, dayIndex) => {
          const slot = schedule.find((s) => s.dayIndex === dayIndex);
          const planDay = slot?.planDayIndex != null ? plan.days[slot.planDayIndex] : null;
          const isDragTarget = dragFrom !== null && dragFrom !== dayIndex;

          return (
            <Card
              key={dayIndex}
              draggable
              onDragStart={() => {
                dragging.current = dayIndex;
                setDragFrom(dayIndex);
              }}
              onDragEnd={() => {
                dragging.current = null;
                setDragFrom(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging.current !== null) swap(dragging.current, dayIndex);
                dragging.current = null;
                setDragFrom(null);
              }}
              className={`flex cursor-grab flex-wrap items-center gap-3 px-4 py-3 transition-colors active:cursor-grabbing ${
                isDragTarget ? "border-navy-hi bg-navy-hi/[0.05]" : ""
              }`}
            >
              <div className="w-24 shrink-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{name.slice(0, 3)}</p>
              </div>
              <div className="min-w-[120px] flex-1">
                <p className="text-[14px] font-medium">{planDay ? planDay.name : "Rest"}</p>
              </div>
              {planDay && (
                <>
                  <input
                    type="time"
                    value={slot?.time ?? "18:00"}
                    onChange={(e) => updateSlot(dayIndex, { time: e.target.value })}
                    className="rounded-lg border border-border-subtle bg-surface-0 px-2 py-1.5 text-[13px] outline-none focus:border-navy-hi"
                  />
                  <button
                    type="button"
                    onClick={() => updateSlot(dayIndex, { reminderEnabled: !slot?.reminderEnabled })}
                    aria-pressed={!!slot?.reminderEnabled}
                    aria-label="Toggle reminder"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                      slot?.reminderEnabled ? "border-navy-hi bg-navy-hi/15 text-navy-hi" : "border-border-subtle text-text-tertiary"
                    }`}
                  >
                    <IconBell width={14} height={14} />
                  </button>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
