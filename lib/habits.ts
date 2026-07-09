import type { Habit, HabitLog } from "@/lib/store/types";
import { todayKey } from "@/lib/id";

export function isDone(logs: HabitLog[], habitId: string, date: string): boolean {
  return logs.some((l) => l.habitId === habitId && l.date === date && l.done);
}

export function currentStreak(logs: HabitLog[], habitId: string, from = new Date()): number {
  let streak = 0;
  const cursor = new Date(from);
  // If today isn't done yet, start counting from yesterday so an unfinished
  // today doesn't zero out an otherwise-live streak.
  if (!isDone(logs, habitId, todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (isDone(logs, habitId, todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function last7Days(from = new Date()): string[] {
  const days: string[] = [];
  const cursor = new Date(from);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    days.push(todayKey(d));
  }
  return days;
}

export function weeklyCompletionRate(logs: HabitLog[], habitId: string, from = new Date()): number {
  const days = last7Days(from);
  const done = days.filter((d) => isDone(logs, habitId, d)).length;
  return done / days.length;
}

export function monthCompletionMap(
  habits: Habit[],
  logs: HabitLog[],
  year: number,
  month: number
): Record<string, number> {
  const map: Record<string, number> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activeHabits = habits.filter((h) => !h.archived);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = todayKey(date);
    if (activeHabits.length === 0) {
      map[key] = 0;
      continue;
    }
    const done = activeHabits.filter((h) => isDone(logs, h.id, key)).length;
    map[key] = done / activeHabits.length;
  }
  return map;
}

export const HABIT_ICON_PRESETS = ["🏋️", "🏃", "💧", "😴", "🥗", "🧘", "🚶", "📝", "🔥", "✅"];
