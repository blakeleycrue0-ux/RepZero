import type { MuscleGroupId, MuscleRating } from "@/lib/store/types";

export const MUSCLE_LABELS: Record<MuscleGroupId, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  back: "Back",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
};

export const RATING_LABELS: Record<MuscleRating, string> = {
  developing: "Developing",
  solid: "Solid",
  strong: "Strong",
};

export const RATING_COLOR_VAR: Record<MuscleRating, string> = {
  developing: "var(--color-developing)",
  solid: "var(--color-solid)",
  strong: "var(--color-strong)",
};

export const RATING_TAG_TONE: Record<MuscleRating, "developing" | "solid" | "strong"> = {
  developing: "developing",
  solid: "solid",
  strong: "strong",
};
