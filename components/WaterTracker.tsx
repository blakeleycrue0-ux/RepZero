"use client";

import { CUP_ML, CUP_COUNT, cupsFilled } from "@/lib/water";
import { IconCupFilled } from "@/components/icons";

export default function WaterTracker({
  totalMl,
  onSetCups,
}: {
  totalMl: number;
  onSetCups: (cups: number) => void;
}) {
  const filled = cupsFilled(totalMl);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-2xl tabular-nums">
          {totalMl}
          <span className="ml-1 text-[13px] font-normal text-text-tertiary">/ {CUP_COUNT * CUP_ML} ml</span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: CUP_COUNT }, (_, i) => {
          const isFilled = i < filled;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSetCups(isFilled && i === filled - 1 ? i : i + 1)}
              aria-label={`${isFilled ? "Remove" : "Add"} cup ${i + 1} of water (${CUP_ML}ml each)`}
              aria-pressed={isFilled}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                isFilled ? "border-navy-hi bg-navy-hi/10 text-navy-hi" : "border-border-subtle text-text-tertiary"
              }`}
            >
              <IconCupFilled width={16} height={16} fillLevel={isFilled ? 1 : 0} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
