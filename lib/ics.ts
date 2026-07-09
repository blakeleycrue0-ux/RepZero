import type { ScheduleSlot, WorkoutPlan } from "@/lib/store/types";
import { brand } from "@/lib/brand";

const ICS_DOW = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export function nextOccurrence(dayIndex: number, time: string, from = new Date()): Date {
  const [h, m] = time.split(":").map(Number);
  const result = new Date(from);
  const currentDow = (from.getDay() + 6) % 7; // Monday = 0
  const delta = (dayIndex - currentDow + 7) % 7;
  result.setDate(from.getDate() + delta);
  result.setHours(h, m, 0, 0);
  if (result <= from) result.setDate(result.getDate() + 7);
  return result;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function toIcsUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeIcs(text: string): string {
  return text.replace(/[\\,;]/g, (m) => `\\${m}`);
}

export function generateSchedureIcs(schedule: ScheduleSlot[], plan: WorkoutPlan): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${brand.name}//Schedule//EN`, "CALSCALE:GREGORIAN"];
  const now = new Date();
  for (const slot of schedule) {
    if (slot.planDayIndex == null || !slot.time) continue;
    const day = plan.days[slot.planDayIndex];
    if (!day || day.isRest) continue;
    const start = nextOccurrence(slot.dayIndex, slot.time, now);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slot.dayIndex}-${plan.id}@${brand.domain}`,
      `DTSTAMP:${toIcsUtc(now)}`,
      `DTSTART:${toIcsLocal(start)}`,
      `DTEND:${toIcsLocal(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${ICS_DOW[slot.dayIndex]}`,
      `SUMMARY:${escapeIcs(`${brand.name}: ${day.name}`)}`,
      `DESCRIPTION:${escapeIcs(day.focus.join(", "))}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
