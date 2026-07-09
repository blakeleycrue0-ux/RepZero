import type { ScheduleSlot, WorkoutPlan } from "@/lib/store/types";
import { nextOccurrence } from "@/lib/ics";
import { brand } from "@/lib/brand";

// Best-effort local reminders: a Notification is scheduled via setTimeout for
// each enabled session in the next 7 days. This only fires while this tab or
// installed PWA process is still alive — mobile OSes routinely suspend
// backgrounded tabs, so it is not a guarantee. For a reliable reminder
// regardless of whether the app is open, use the "Add to calendar" export,
// or wire a real Web Push server (VAPID keys + a scheduled sender) later.
let activeTimers: ReturnType<typeof setTimeout>[] = [];

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function scheduleUpcomingReminders(schedule: ScheduleSlot[], plan: WorkoutPlan | null) {
  activeTimers.forEach(clearTimeout);
  activeTimers = [];

  if (!notificationsSupported() || Notification.permission !== "granted" || !plan) return;

  const now = new Date();
  for (const slot of schedule) {
    if (!slot.reminderEnabled || slot.planDayIndex == null || !slot.time) continue;
    const day = plan.days[slot.planDayIndex];
    if (!day || day.isRest) continue;
    const when = nextOccurrence(slot.dayIndex, slot.time, now);
    const delay = when.getTime() - now.getTime();
    if (delay <= 0 || delay > 7 * 24 * 60 * 60 * 1000) continue;
    const timer = setTimeout(() => {
      try {
        new Notification(`${brand.name}: ${day.name}`, {
          body: `Scheduled for ${slot.time} — ${day.focus.join(", ")}`,
          icon: "/icon-192.png",
        });
      } catch {
        // ignore — some browsers require SW-based notifications
      }
    }, delay);
    activeTimers.push(timer);
  }
}
