export type Goal = "build_muscle" | "lose_fat" | "recomposition" | "general_health";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Equipment = "full_gym" | "home" | "minimal";
export type DietPattern =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "halal"
  | "kosher"
  | "other";

export interface Profile {
  goal: Goal;
  experience: Experience;
  daysPerWeek: number;
  equipment: Equipment;
  dietPattern: DietPattern;
  allergies: string[];
  ageConfirmed: boolean;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export type MuscleRating = "developing" | "solid" | "strong";

export const MUSCLE_GROUPS = [
  "chest",
  "shoulders",
  "back",
  "biceps",
  "triceps",
  "core",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
] as const;

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number];

export interface MuscleGroupRating {
  id: MuscleGroupId;
  rating: MuscleRating;
  note: string;
}

export type BodyCompositionEstimate = "lean" | "moderate" | "higher";

export interface BodyComposition {
  estimate: BodyCompositionEstimate;
  note: string;
}

export interface ScanResult {
  id: string;
  createdAt: string;
  groups: MuscleGroupRating[];
  bodyComposition: BodyComposition | null;
  summary: string;
  topPriorities: MuscleGroupId[];
}

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  targets: MuscleGroupId[];
  notes?: string;
}

export interface PlanDay {
  day: string;
  name: string;
  focus: MuscleGroupId[];
  exercises: PlanExercise[];
  isRest: boolean;
}

export interface WorkoutPlan {
  id: string;
  createdAt: string;
  daysPerWeek: number;
  days: PlanDay[];
  addressesPriorities: MuscleGroupId[];
  summary: string;
}

export interface ScheduleSlot {
  dayIndex: number; // 0-6, Monday = 0
  planDayIndex: number | null; // index into plan.days, null = rest
  time: string | null; // "18:00"
  reminderEnabled: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  done: boolean;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface NutritionMeal {
  name: string;
  description: string;
  calories: number;
  items: string[];
}

export interface NutritionDay {
  day: string; // "Monday", "Tuesday", ...
  meals: NutritionMeal[];
}

export interface NutritionPlan {
  id: string;
  createdAt: string;
  targetCalories: number;
  maintenanceCalories: number;
  calorieStrategy: "deficit" | "surplus" | "maintenance";
  macros: { protein: number; carbs: number; fat: number };
  days: NutritionDay[];
  notes: string;
}

export interface AppData {
  profile: Profile | null;
  scans: ScanResult[];
  plans: WorkoutPlan[];
  schedule: ScheduleSlot[];
  habits: Habit[];
  habitLogs: HabitLog[];
  waterLogs: WaterLog[];
  coachThread: ChatMessage[];
  nutritionThread: ChatMessage[];
  nutritionPlans: NutritionPlan[];
}
