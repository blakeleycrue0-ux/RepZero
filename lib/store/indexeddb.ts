import { createStore, get, set, del, keys, clear } from "idb-keyval";
import type { DataStore } from "./interface";
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
  AppData,
} from "./types";

// Each collection gets its own IndexedDB database. idb-keyval's createStore
// only creates an object store during that database's initial upgrade, so
// reusing one DB name across multiple createStore() calls silently drops
// every store after the first — separate DB names sidestep that entirely.
const DB_PREFIX = "repzero";

const profileStore = createStore(`${DB_PREFIX}-profile`, "profile");
const scanStore = createStore(`${DB_PREFIX}-scans`, "scans");
const planStore = createStore(`${DB_PREFIX}-plans`, "plans");
const scheduleStore = createStore(`${DB_PREFIX}-schedule`, "schedule");
const habitStore = createStore(`${DB_PREFIX}-habits`, "habits");
const habitLogStore = createStore(`${DB_PREFIX}-habitLogs`, "habitLogs");
const waterLogStore = createStore(`${DB_PREFIX}-waterLogs`, "waterLogs");
const threadStore = createStore(`${DB_PREFIX}-threads`, "threads");
const nutritionPlanStore = createStore(`${DB_PREFIX}-nutritionPlans`, "nutritionPlans");

const PROFILE_KEY = "current";
const SCHEDULE_KEY = "current";
const COACH_THREAD_KEY = "coach";
const NUTRITION_THREAD_KEY = "nutrition";

async function listAll<T>(store: ReturnType<typeof createStore>): Promise<T[]> {
  const ks = await keys(store);
  const values = await Promise.all(ks.map((k) => get<T>(k, store)));
  const result: T[] = [];
  for (const v of values) if (v !== undefined) result.push(v);
  return result;
}

export class IndexedDbStore implements DataStore {
  async getProfile() {
    return (await get<Profile>(PROFILE_KEY, profileStore)) ?? null;
  }
  async saveProfile(profile: Profile) {
    await set(PROFILE_KEY, profile, profileStore);
  }

  async listScans() {
    const scans = await listAll<ScanResult>(scanStore);
    return scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async saveScan(scan: ScanResult) {
    await set(scan.id, scan, scanStore);
  }

  async listPlans() {
    const plans = await listAll<WorkoutPlan>(planStore);
    return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async savePlan(plan: WorkoutPlan) {
    await set(plan.id, plan, planStore);
  }
  async latestPlan() {
    const plans = await this.listPlans();
    return plans[0] ?? null;
  }

  async getSchedule() {
    return (await get<ScheduleSlot[]>(SCHEDULE_KEY, scheduleStore)) ?? [];
  }
  async saveSchedule(schedule: ScheduleSlot[]) {
    await set(SCHEDULE_KEY, schedule, scheduleStore);
  }

  async listHabits() {
    return listAll<Habit>(habitStore);
  }
  async saveHabit(habit: Habit) {
    await set(habit.id, habit, habitStore);
  }
  async deleteHabit(id: string) {
    await del(id, habitStore);
  }

  async listHabitLogs() {
    return listAll<HabitLog>(habitLogStore);
  }
  async setHabitLog(log: HabitLog) {
    await set(`${log.date}:${log.habitId}`, log, habitLogStore);
  }

  async listWaterLogs() {
    return listAll<WaterLog>(waterLogStore);
  }
  async setWaterLog(log: WaterLog) {
    await set(log.date, log, waterLogStore);
  }

  async getCoachThread() {
    return (await get<ChatMessage[]>(COACH_THREAD_KEY, threadStore)) ?? [];
  }
  async saveCoachThread(messages: ChatMessage[]) {
    await set(COACH_THREAD_KEY, messages, threadStore);
  }

  async getNutritionThread() {
    return (await get<ChatMessage[]>(NUTRITION_THREAD_KEY, threadStore)) ?? [];
  }
  async saveNutritionThread(messages: ChatMessage[]) {
    await set(NUTRITION_THREAD_KEY, messages, threadStore);
  }

  async listNutritionPlans() {
    const plans = await listAll<NutritionPlan>(nutritionPlanStore);
    return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async saveNutritionPlan(plan: NutritionPlan) {
    await set(plan.id, plan, nutritionPlanStore);
  }

  async exportAll(): Promise<AppData> {
    const [
      profile,
      scans,
      plans,
      schedule,
      habits,
      habitLogs,
      waterLogs,
      coachThread,
      nutritionThread,
      nutritionPlans,
    ] = await Promise.all([
      this.getProfile(),
      this.listScans(),
      this.listPlans(),
      this.getSchedule(),
      this.listHabits(),
      this.listHabitLogs(),
      this.listWaterLogs(),
      this.getCoachThread(),
      this.getNutritionThread(),
      this.listNutritionPlans(),
    ]);
    return {
      profile,
      scans,
      plans,
      schedule,
      habits,
      habitLogs,
      waterLogs,
      coachThread,
      nutritionThread,
      nutritionPlans,
    };
  }

  async deleteAll() {
    await Promise.all([
      clear(profileStore),
      clear(scanStore),
      clear(planStore),
      clear(scheduleStore),
      clear(habitStore),
      clear(habitLogStore),
      clear(waterLogStore),
      clear(threadStore),
      clear(nutritionPlanStore),
    ]);
  }
}
