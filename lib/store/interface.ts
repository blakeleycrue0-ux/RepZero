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

// Swappable persistence contract. IndexedDB (local-first) implements this
// today; a Supabase/Postgres implementation can drop in later without any
// UI changes.
export interface DataStore {
  getProfile(): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;

  listScans(): Promise<ScanResult[]>;
  saveScan(scan: ScanResult): Promise<void>;

  listPlans(): Promise<WorkoutPlan[]>;
  savePlan(plan: WorkoutPlan): Promise<void>;
  latestPlan(): Promise<WorkoutPlan | null>;

  getSchedule(): Promise<ScheduleSlot[]>;
  saveSchedule(schedule: ScheduleSlot[]): Promise<void>;

  listHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;

  listHabitLogs(): Promise<HabitLog[]>;
  setHabitLog(log: HabitLog): Promise<void>;

  listWaterLogs(): Promise<WaterLog[]>;
  setWaterLog(log: WaterLog): Promise<void>;

  getCoachThread(): Promise<ChatMessage[]>;
  saveCoachThread(messages: ChatMessage[]): Promise<void>;

  getNutritionThread(): Promise<ChatMessage[]>;
  saveNutritionThread(messages: ChatMessage[]): Promise<void>;

  listNutritionPlans(): Promise<NutritionPlan[]>;
  saveNutritionPlan(plan: NutritionPlan): Promise<void>;

  exportAll(): Promise<AppData>;
  deleteAll(): Promise<void>;
}
