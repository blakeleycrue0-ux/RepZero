"use client";

import { useState } from "react";
import { BodyMapFront, BodyMapBack, type RatingMap } from "./BodyMap";
import type { MuscleGroupId, MuscleGroupRating } from "@/lib/store/types";
import { MUSCLE_LABELS, RATING_LABELS, RATING_TAG_TONE } from "@/lib/muscle-labels";
import { Tag } from "@/components/ui";

export default function BodyMapPanel({ groups }: { groups: MuscleGroupRating[] }) {
  const [view, setView] = useState<"front" | "back">("front");
  const [active, setActive] = useState<MuscleGroupId | null>(null);

  const ratings: RatingMap = Object.fromEntries(groups.map((g) => [g.id, g.rating]));
  const activeGroup = groups.find((g) => g.id === active) ?? null;

  return (
    <div>
      <div className="flex items-center justify-center gap-1 md:hidden">
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              view === v ? "bg-surface-inverse text-text-inverse" : "text-text-secondary"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start justify-center gap-8">
        <div className={view === "front" ? "block" : "hidden md:block"}>
          <BodyMapFront ratings={ratings} active={active} onSelect={setActive} />
          <p className="mt-1 text-center text-[11px] text-text-tertiary">Front</p>
        </div>
        <div className={view === "back" ? "block" : "hidden md:block"}>
          <BodyMapBack ratings={ratings} active={active} onSelect={setActive} />
          <p className="mt-1 text-center text-[11px] text-text-tertiary">Back</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-[12px] text-text-secondary">
        {(["developing", "solid", "strong"] as const).map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-${r})` }} />
            {RATING_LABELS[r]}
          </span>
        ))}
      </div>

      <div className="mt-5 min-h-[76px] rounded-2xl border border-border-subtle bg-surface-1 p-4">
        {activeGroup ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium">{MUSCLE_LABELS[activeGroup.id]}</span>
              <Tag tone={RATING_TAG_TONE[activeGroup.rating]}>{RATING_LABELS[activeGroup.rating]}</Tag>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">{activeGroup.note}</p>
          </div>
        ) : (
          <p className="text-[13px] text-text-tertiary">Tap any region to see the note behind its rating.</p>
        )}
      </div>
    </div>
  );
}
