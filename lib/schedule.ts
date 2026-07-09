import type { ScheduleSlot, WorkoutPlan } from "@/lib/store/types";

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function buildDefaultSchedule(plan: WorkoutPlan): ScheduleSlot[] {
  return WEEKDAY_NAMES.map((_, dayIndex) => {
    const planDayIndex = dayIndex < plan.days.length && !plan.days[dayIndex].isRest ? dayIndex : null;
    return {
      dayIndex,
      planDayIndex,
      time: planDayIndex !== null ? "18:00" : null,
      reminderEnabled: planDayIndex !== null,
    };
  });
}
