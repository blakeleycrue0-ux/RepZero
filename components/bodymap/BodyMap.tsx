"use client";

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
      {/* head outline */}
      <circle cx="120" cy="34" r="22" fill="none" stroke="var(--border-subtle)" strokeWidth={1.2} />
      {/* forearms/hands outline (not rated) */}
      <OutlinePart d="M58,166 L46,252 L54,257 L68,170 Z" />
      <OutlinePart d="M182,166 L194,252 L186,257 L172,170 Z" />
      {/* torso base outline */}
      <OutlinePart d="M88,82 C74,92 68,112 68,132 L75,207 L165,207 L172,132 C172,112 166,92 152,82" />

      {/* traps/neck — colored with shoulders rating, closes the gap to a filled silhouette */}
      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M104,56 C104,64 110,72 120,72 C130,72 136,64 136,56 L133,82 C128,86 112,86 107,82 Z" />

      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M88,82 C68,84 52,98 50,122 C50,136 60,143 72,140 L82,108 C82,96 84,88 88,82 Z" />
      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M152,82 C172,84 188,98 190,122 C190,136 180,143 168,140 L158,108 C158,96 156,88 152,82 Z" />

      <Region id="chest" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,94 C90,86 105,82 120,82 C135,82 150,86 150,94 L150,136 C137,146 103,146 90,136 Z" />

      <Region id="biceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M70,110 C62,116 56,140 56,168 L70,173 C74,148 78,126 84,112 Z" />
      <Region id="biceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M170,110 C178,116 184,140 184,168 L170,173 C166,148 162,126 156,112 Z" />

      <Region id="core" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M94,140 C107,148 133,148 146,140 L152,198 C133,209 107,209 88,198 Z" />

      <Region id="quads" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M86,210 L78,298 C78,306 106,310 111,300 L114,210 Z" />
      <Region id="quads" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M154,210 L162,298 C162,306 134,310 129,300 L126,210 Z" />

      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M82,314 C79,336 79,360 84,378 L106,378 C109,360 107,336 105,314 Z" />
      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M158,314 C161,336 161,360 156,378 L134,378 C131,360 133,336 135,314 Z" />

      <OutlinePart d="M84,382 L82,396 L108,396 L106,382" />
      <OutlinePart d="M156,382 L158,396 L132,396 L134,382" />
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
      <circle cx="120" cy="34" r="22" fill="none" stroke="var(--border-subtle)" strokeWidth={1.2} />
      <OutlinePart d="M58,166 L46,252 L54,257 L68,170 Z" />
      <OutlinePart d="M182,166 L194,252 L186,257 L172,170 Z" />

      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M104,56 C104,64 110,72 120,72 C130,72 136,64 136,56 L133,82 C128,86 112,86 107,82 Z" />

      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M88,82 C68,84 52,98 50,122 C50,136 60,143 72,140 L82,108 C82,96 84,88 88,82 Z" />
      <Region id="shoulders" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M152,82 C172,84 188,98 190,122 C190,136 180,143 168,140 L158,108 C158,96 156,88 152,82 Z" />

      <Region id="back" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M90,86 C87,89 75,109 75,133 L82,199 C104,210 136,210 158,199 L165,133 C165,109 153,89 150,86 C137,95 103,95 90,86 Z" />

      <Region id="triceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M70,110 C62,116 56,140 56,168 L70,173 C74,148 78,126 84,112 Z" />
      <Region id="triceps" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M170,110 C178,116 184,140 184,168 L170,173 C166,148 162,126 156,112 Z" />

      <Region id="glutes" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M82,211 C79,228 82,245 89,254 C102,261 138,261 151,254 C158,245 161,228 158,211 C134,220 106,220 82,211 Z" />

      <Region id="hamstrings" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M86,255 L78,302 C78,310 105,314 110,304 L112,257 Z" />
      <Region id="hamstrings" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M154,255 L162,302 C162,310 135,314 130,304 L128,257 Z" />

      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M82,314 C79,336 79,360 84,378 L106,378 C109,360 107,336 105,314 Z" />
      <Region id="calves" ratings={ratings} active={active ?? null} onSelect={onSelect}
        d="M158,314 C161,336 161,360 156,378 L134,378 C131,360 133,336 135,314 Z" />

      <OutlinePart d="M84,382 L82,396 L108,396 L106,382" />
      <OutlinePart d="M156,382 L158,396 L132,396 L134,382" />
    </svg>
  );
}
