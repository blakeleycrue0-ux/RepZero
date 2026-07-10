import { supabase, supabaseEnabled, onAuthStateChange, getSession } from "./client";
import { IndexedDbStore } from "@/lib/store/indexeddb";
import type { DataStore } from "@/lib/store/interface";
import type {
  Profile,
  ScanResult,
  WorkoutPlan,
  ScheduleSlot,
  Habit,
  HabitLog,
  WaterLog,
  ChatMessage,
  NutritionPlan,
} from "@/lib/store/types";

let currentUserId: string | null = null;
let pulledForUser: string | null = null;
const listeners = new Set<(signedIn: boolean) => void>();

export function onSyncStateChange(cb: (signedIn: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isSignedIn(): boolean {
  return currentUserId !== null;
}

export function initAuthSync() {
  if (!supabaseEnabled) return;
  getSession().then((session) => {
    currentUserId = session?.user.id ?? null;
    if (currentUserId) pullRemoteIntoLocal(currentUserId);
    listeners.forEach((l) => l(currentUserId !== null));
  });
  onAuthStateChange((session) => {
    const nextId = session?.user.id ?? null;
    const changed = nextId !== currentUserId;
    currentUserId = nextId;
    if (currentUserId && changed) pullRemoteIntoLocal(currentUserId);
    if (changed) listeners.forEach((l) => l(currentUserId !== null));
  });
}

function fail(label: string) {
  return (err: unknown) => console.warn(`[sync] ${label} failed (offline or RLS)`, err);
}

// Pull once per session: merge remote rows into local IndexedDB so a
// returning user (or a new device) gets their data back. Collections are
// merged by id/key — remote fills in anything missing locally, local rows
// already present are left alone so unsynced offline edits aren't clobbered.
async function pullRemoteIntoLocal(userId: string) {
  if (!supabase || pulledForUser === userId) return;
  pulledForUser = userId;
  const local = new IndexedDbStore();

  try {
    const { data: profileRow } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (profileRow) {
      const localProfile = await local.getProfile();
      if (!localProfile) {
        await local.saveProfile({
          goal: profileRow.goal,
          experience: profileRow.experience,
          daysPerWeek: profileRow.days_per_week,
          equipment: profileRow.equipment,
          dietPattern: profileRow.diet_pattern,
          allergies: profileRow.allergies ?? [],
          ageConfirmed: profileRow.age_confirmed,
          displayName: profileRow.display_name ?? undefined,
          foodLikes: profileRow.food_likes ?? undefined,
          foodDislikes: profileRow.food_dislikes ?? undefined,
          createdAt: profileRow.created_at,
          updatedAt: profileRow.updated_at,
        });
      }
    }

    const [scans, plans, scheduleRow, habits, habitLogs, waterLogs, nutritionPlans, threads] = await Promise.all([
      supabase.from("scans").select("*").eq("user_id", userId),
      supabase.from("plans").select("*").eq("user_id", userId),
      supabase.from("schedules").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_logs").select("*").eq("user_id", userId),
      supabase.from("water_logs").select("*").eq("user_id", userId),
      supabase.from("nutrition_plans").select("*").eq("user_id", userId),
      supabase.from("chat_threads").select("*").eq("user_id", userId),
    ]);

    const localScans = await local.listScans();
    const localScanIds = new Set(localScans.map((s) => s.id));
    for (const row of scans.data ?? []) {
      if (localScanIds.has(row.id)) continue;
      await local.saveScan({
        id: row.id,
        createdAt: row.created_at,
        groups: row.groups,
        bodyComposition: row.body_composition ?? null,
        summary: row.summary,
        topPriorities: row.top_priorities ?? [],
      });
    }

    const localPlans = await local.listPlans();
    const localPlanIds = new Set(localPlans.map((p) => p.id));
    for (const row of plans.data ?? []) {
      if (localPlanIds.has(row.id)) continue;
      await local.savePlan({
        id: row.id,
        createdAt: row.created_at,
        daysPerWeek: row.days_per_week,
        days: row.days,
        addressesPriorities: row.addresses_priorities ?? [],
        summary: row.summary,
      });
    }

    if (scheduleRow.data) {
      const localSchedule = await local.getSchedule();
      if (localSchedule.length === 0) await local.saveSchedule(scheduleRow.data.schedule);
    }

    const localHabits = await local.listHabits();
    const localHabitIds = new Set(localHabits.map((h) => h.id));
    for (const row of habits.data ?? []) {
      if (localHabitIds.has(row.id)) continue;
      await local.saveHabit({
        id: row.id,
        name: row.name,
        icon: row.icon,
        createdAt: row.created_at,
        archived: row.archived,
      });
    }

    const localHabitLogs = await local.listHabitLogs();
    const localHabitLogKeys = new Set(localHabitLogs.map((l) => `${l.date}:${l.habitId}`));
    for (const row of habitLogs.data ?? []) {
      const key = `${row.date}:${row.habit_id}`;
      if (localHabitLogKeys.has(key)) continue;
      await local.setHabitLog({ habitId: row.habit_id, date: row.date, done: row.done });
    }

    const localWaterLogs = await local.listWaterLogs();
    const localWaterDates = new Set(localWaterLogs.map((w) => w.date));
    for (const row of waterLogs.data ?? []) {
      if (localWaterDates.has(row.date)) continue;
      await local.setWaterLog({ date: row.date, ml: row.ml });
    }

    const localNutritionPlans = await local.listNutritionPlans();
    const localNutritionIds = new Set(localNutritionPlans.map((p) => p.id));
    for (const row of nutritionPlans.data ?? []) {
      if (localNutritionIds.has(row.id)) continue;
      await local.saveNutritionPlan({
        id: row.id,
        createdAt: row.created_at,
        targetCalories: row.target_calories,
        maintenanceCalories: row.maintenance_calories,
        calorieStrategy: row.calorie_strategy,
        macros: row.macros,
        days: row.days,
        notes: row.notes,
      });
    }

    for (const row of threads.data ?? []) {
      if (row.kind === "coach") {
        const existing = await local.getCoachThread();
        if (existing.length === 0) await local.saveCoachThread(row.messages);
      } else if (row.kind === "nutrition") {
        const existing = await local.getNutritionThread();
        if (existing.length === 0) await local.saveNutritionThread(row.messages);
      }
    }
  } catch (err) {
    console.warn("[sync] pull failed", err);
  }
}

// Decorates IndexedDbStore: every write also fires a best-effort, non-blocking
// upsert to Supabase when signed in. Local IndexedDB stays the source of
// truth the UI reads from, so a slow/offline network never blocks the app —
// sync is purely additive.
export class SyncedStore extends IndexedDbStore implements DataStore {
  async saveProfile(profile: Profile) {
    await super.saveProfile(profile);
    if (!supabase || !currentUserId) return;
    supabase
      .from("profiles")
      .upsert({
        user_id: currentUserId,
        goal: profile.goal,
        experience: profile.experience,
        days_per_week: profile.daysPerWeek,
        equipment: profile.equipment,
        diet_pattern: profile.dietPattern,
        allergies: profile.allergies,
        age_confirmed: profile.ageConfirmed,
        display_name: profile.displayName ?? null,
        food_likes: profile.foodLikes ?? null,
        food_dislikes: profile.foodDislikes ?? null,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
      })
      .then(undefined, fail("saveProfile"));
  }

  async saveScan(scan: ScanResult) {
    await super.saveScan(scan);
    if (!supabase || !currentUserId) return;
    supabase
      .from("scans")
      .upsert({
        id: scan.id,
        user_id: currentUserId,
        created_at: scan.createdAt,
        groups: scan.groups,
        body_composition: scan.bodyComposition,
        summary: scan.summary,
        top_priorities: scan.topPriorities,
      })
      .then(undefined, fail("saveScan"));
  }

  async savePlan(plan: WorkoutPlan) {
    await super.savePlan(plan);
    if (!supabase || !currentUserId) return;
    supabase
      .from("plans")
      .upsert({
        id: plan.id,
        user_id: currentUserId,
        created_at: plan.createdAt,
        days_per_week: plan.daysPerWeek,
        days: plan.days,
        addresses_priorities: plan.addressesPriorities,
        summary: plan.summary,
      })
      .then(undefined, fail("savePlan"));
  }

  async saveSchedule(schedule: ScheduleSlot[]) {
    await super.saveSchedule(schedule);
    if (!supabase || !currentUserId) return;
    supabase
      .from("schedules")
      .upsert({ user_id: currentUserId, schedule })
      .then(undefined, fail("saveSchedule"));
  }

  async saveHabit(habit: Habit) {
    await super.saveHabit(habit);
    if (!supabase || !currentUserId) return;
    supabase
      .from("habits")
      .upsert({
        id: habit.id,
        user_id: currentUserId,
        name: habit.name,
        icon: habit.icon,
        created_at: habit.createdAt,
        archived: habit.archived,
      })
      .then(undefined, fail("saveHabit"));
  }

  async deleteHabit(id: string) {
    await super.deleteHabit(id);
    if (!supabase || !currentUserId) return;
    supabase
      .from("habits")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId)
      .then(undefined, fail("deleteHabit"));
  }

  async setHabitLog(log: HabitLog) {
    await super.setHabitLog(log);
    if (!supabase || !currentUserId) return;
    supabase
      .from("habit_logs")
      .upsert({ user_id: currentUserId, habit_id: log.habitId, date: log.date, done: log.done })
      .then(undefined, fail("setHabitLog"));
  }

  async setWaterLog(log: WaterLog) {
    await super.setWaterLog(log);
    if (!supabase || !currentUserId) return;
    supabase
      .from("water_logs")
      .upsert({ user_id: currentUserId, date: log.date, ml: log.ml })
      .then(undefined, fail("setWaterLog"));
  }

  async saveCoachThread(messages: ChatMessage[]) {
    await super.saveCoachThread(messages);
    if (!supabase || !currentUserId) return;
    supabase
      .from("chat_threads")
      .upsert({ user_id: currentUserId, kind: "coach", messages })
      .then(undefined, fail("saveCoachThread"));
  }

  async saveNutritionThread(messages: ChatMessage[]) {
    await super.saveNutritionThread(messages);
    if (!supabase || !currentUserId) return;
    supabase
      .from("chat_threads")
      .upsert({ user_id: currentUserId, kind: "nutrition", messages })
      .then(undefined, fail("saveNutritionThread"));
  }

  async saveNutritionPlan(plan: NutritionPlan) {
    await super.saveNutritionPlan(plan);
    if (!supabase || !currentUserId) return;
    supabase
      .from("nutrition_plans")
      .upsert({
        id: plan.id,
        user_id: currentUserId,
        created_at: plan.createdAt,
        target_calories: plan.targetCalories,
        maintenance_calories: plan.maintenanceCalories,
        calorie_strategy: plan.calorieStrategy,
        macros: plan.macros,
        days: plan.days,
        notes: plan.notes,
      })
      .then(undefined, fail("saveNutritionPlan"));
  }

  async deleteAll() {
    await super.deleteAll();
    if (!supabase || !currentUserId) return;
    const uid = currentUserId;
    const tables = [
      "profiles",
      "scans",
      "plans",
      "schedules",
      "habits",
      "habit_logs",
      "water_logs",
      "nutrition_plans",
      "chat_threads",
    ];
    await Promise.all(
      tables.map((t) => supabase!.from(t).delete().eq("user_id", uid).then(undefined, fail(`deleteAll:${t}`)))
    );
  }
}
