"use client";

import { useState } from "react";
import type { MuscleGroupId, MuscleRating } from "@/lib/store/types";
import { RATING_COLOR_VAR } from "@/lib/muscle-labels";

export type RatingMap = Partial<Record<MuscleGroupId, MuscleRating>>;

const NEUTRAL = "var(--border-strong)";
const NEUTRAL_FILL = "var(--surface-2)";

function fillFor(ratings: RatingMap, id: MuscleGroupId) {
  const r = ratings[id];
  return r ? RATING_COLOR_VAR[r] : NEUTRAL_FILL;
}
function strokeFor(ratings: RatingMap, id: MuscleGroupId, active: boolean) {
  if (active) return "var(--text-primary)";
  const r = ratings[id];
  return r ? RATING_COLOR_VAR[r] : NEUTRAL;
}

interface RegionProps {
  id: MuscleGroupId;
  ratings: RatingMap;
  active: string | null;
  onSelect?: (id: MuscleGroupId) => void;
  d?: string;
  children?: React.ReactNode;
}

function Region({ id, ratings, active, onSelect, d, children }: RegionProps) {
  const isActive = active === id;
  const commonProps = {
    fill: fillFor(ratings, id),
    stroke: strokeFor(ratings, id, isActive),
    strokeWidth: isActive ? 2.5 : 1.5,
    opacity: ratings[id] ? (isActive ? 1 : 0.9) : 0.55,
    style: { transition: "all 160ms ease", cursor: onSelect ? "pointer" : "default" },
    onClick: onSelect ? () => onSelect(id) : undefined,
    role: onSelect ? "button" : undefined,
    tabIndex: onSelect ? 0 : undefined,
    "aria-label": id,
  };
  if (d) return <path {...commonProps} d={d} />;
  return <g {...commonProps}>{children}</g>;
}

function OutlinePart({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="var(--border-subtle)" strokeWidth={1.2} />;
}

export function BodyMapFront({
  ratings,
  active,
  onSelect,
}: {
  ratings: RatingMap;
  active?: string | null;
  onSelect?: (id: MuscleGroupId) => void;
}) {
  return (
    <svg viewBox="0 0 240 460" className="h-auto w-full max-w-[260px]" role="img" aria-label="Front body map">
      {/* head + neck outline */}
      <circle cx="120" cy="36" r="24" fill="none" stroke="var(--border-subtle)" strokeWidth={1.2} />
      <OutlinePart d="M108,58 L108,76 L132,76 L132,58" />
      {/* forearms/hands outline (not rated) */}
      <OutlinePart d="M62,168 L52,250 L58,254 L70,172 Z" />
      <OutlinePart d="M178,168 L188,250 L182,254 L170,172 Z" />
      {/* torso base outline */}
      <OutlinePart d="M90,84 C78,92 72,110 72,130 L78,205 L162,205 L168,130 C168,110 162,92 150,84" />

      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,84 C74,86 60,98 58,120 C58,132 66,138 76,136 L84,110 C84,98 86,90 90,84 Z" />
      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M150,84 C166,86 180,98 182,120 C182,132 174,138 164,136 L156,110 C156,98 154,90 150,84 Z" />

      <Region id="chest" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M92,96 C92,90 106,86 120,86 C134,86 148,90 148,96 L148,134 C136,142 104,142 92,134 Z" />

      <Region id="biceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M74,112 C68,116 62,140 62,166 L74,170 C78,146 82,126 86,114 Z" />
      <Region id="biceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M166,112 C172,116 178,140 178,166 L166,170 C162,146 158,126 154,114 Z" />

      <Region id="core" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M96,140 C108,146 132,146 144,140 L150,196 C132,206 108,206 90,196 Z" />

      <Region id="quads" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,208 L84,296 C84,302 108,306 112,298 L114,208 Z" />
      <Region id="quads" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M150,208 L156,296 C156,302 132,306 128,298 L126,208 Z" />

      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M86,312 C84,332 84,356 88,374 L106,374 C108,356 106,332 104,312 Z" />
      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M154,312 C156,332 156,356 152,374 L134,374 C132,356 134,332 136,312 Z" />

      <OutlinePart d="M88,378 L86,392 L108,392 L106,378" />
      <OutlinePart d="M152,378 L154,392 L132,392 L134,378" />
    </svg>
  );
}

export function BodyMapBack({
  ratings,
  active,
  onSelect,
}: {
  ratings: RatingMap;
  active?: string | null;
  onSelect?: (id: MuscleGroupId) => void;
}) {
  return (
    <svg viewBox="0 0 240 460" className="h-auto w-full max-w-[260px]" role="img" aria-label="Back body map">
      <circle cx="120" cy="36" r="24" fill="none" stroke="var(--border-subtle)" strokeWidth={1.2} />
      <OutlinePart d="M108,58 L108,76 L132,76 L132,58" />
      <OutlinePart d="M62,168 L52,250 L58,254 L70,172 Z" />
      <OutlinePart d="M178,168 L188,250 L182,254 L170,172 Z" />

      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,84 C74,86 60,98 58,120 C58,132 66,138 76,136 L84,110 C84,98 86,90 90,84 Z" />
      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M150,84 C166,86 180,98 182,120 C182,132 174,138 164,136 L156,110 C156,98 154,90 150,84 Z" />

      <Region id="back" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M92,88 C90,90 78,108 78,132 L84,196 C104,206 136,206 156,196 L162,132 C162,108 150,90 148,88 C136,96 104,96 92,88 Z" />

      <Region id="triceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M74,112 C68,116 62,140 62,166 L74,170 C78,146 82,126 86,114 Z" />
      <Region id="triceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M166,112 C172,116 178,140 178,166 L166,170 C162,146 158,126 154,114 Z" />

      <Region id="glutes" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M86,208 C84,224 86,240 92,248 C104,254 136,254 148,248 C154,240 156,224 154,208 C132,216 108,216 86,208 Z" />

      <Region id="hamstrings" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,252 L84,300 C84,306 106,310 110,302 L110,254 Z" />
      <Region id="hamstrings" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M150,252 L156,300 C156,306 134,310 130,302 L130,254 Z" />

      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M86,312 C84,334 84,358 88,376 L106,376 C108,358 106,334 104,312 Z" />
      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M154,312 C156,334 156,358 152,376 L134,376 C132,358 134,334 136,312 Z" />

      <OutlinePart d="M88,380 L86,394 L108,394 L106,380" />
      <OutlinePart d="M152,380 L154,394 L132,394 L134,380" />
    </svg>
  );
}
