export const CUP_ML = 250;
export const DAILY_GOAL_ML = 2000;
export const CUP_COUNT = Math.round(DAILY_GOAL_ML / CUP_ML); // 8

export function cupsFilled(totalMl: number): number {
  return Math.round(totalMl / CUP_ML);
}
