"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { Habit, HabitLog, ScanResult, MuscleRating } from "@/lib/store/types";
import { currentStreak } from "@/lib/habits";
import { drawScanCard, drawStatCard, drawComparisonCard, shareOrDownload } from "@/lib/sharecard";
import { Card, PrimaryButton, SecondaryButton, EmptyState, Spinner } from "@/components/ui";
import { IconShare } from "@/components/icons";
import { brand } from "@/lib/brand";

const RANK: Record<MuscleRating, number> = { developing: 0, solid: 1, strong: 2 };

type Template = "scan" | "streak" | "compare";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [template, setTemplate] = useState<Template>("scan");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const store = getStore();
    Promise.all([store.listScans(), store.listHabits(), store.listHabitLogs()]).then(([sc, h, l]) => {
      setScans(sc);
      setHabits(h.filter((x) => !x.archived));
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const latest = scans[0] ?? null;
  const oldest = scans[scans.length - 1] ?? null;
  const bestStreak = useMemo(
    () => habits.reduce((max, h) => Math.max(max, currentStreak(logs, h.id)), 0),
    [habits, logs]
  );
  const improved = useMemo(() => {
    if (!latest || !oldest || latest.id === oldest.id) return 0;
    let count = 0;
    for (const g of latest.groups) {
      const before = oldest.groups.find((o) => o.id === g.id);
      if (before && RANK[g.rating] > RANK[before.rating]) count++;
    }
    return count;
  }, [latest, oldest]);

  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const target = canvasRef.current;
    let source: HTMLCanvasElement | null = null;
    if (template === "scan" && latest) {
      source = drawScanCard(latest.groups, latest.summary);
    } else if (template === "streak") {
      source = drawStatCard(
        "Consistency",
        String(bestStreak),
        bestStreak > 0 ? "day streak, and counting." : "Start a streak today."
      );
    } else if (template === "compare" && latest && oldest && latest.id !== oldest.id) {
      source = drawComparisonCard(
        new Date(oldest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        new Date(latest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        improved,
        latest.groups.length
      );
    }
    if (source) {
      target.width = source.width;
      target.height = source.height;
      const ctx = target.getContext("2d");
      ctx?.drawImage(source, 0, 0);
    }
  }, [template, latest, oldest, bestStreak, improved, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyState
          title="Nothing to show yet"
          description="Scan once to unlock your progress card and history."
          action={
            <Link href="/scan">
              <PrimaryButton>Start a scan</PrimaryButton>
            </Link>
          }
        />
      </div>
    );
  }

  const canCompare = scans.length >= 2;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:py-12">
      <h1 className="font-display text-3xl">Progress</h1>

      <Card className="mt-6 overflow-hidden">
        <canvas ref={canvasRef} className="w-full" style={{ aspectRatio: "1080 / 1350" }} />
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { key: "scan", label: "Latest scan", disabled: false },
            { key: "streak", label: "Streak", disabled: false },
            { key: "compare", label: "Before → after", disabled: !canCompare },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={t.disabled}
            onClick={() => setTemplate(t.key)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-30 ${
              template === t.key ? "bg-surface-inverse text-text-inverse" : "border border-border-subtle text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <PrimaryButton
        onClick={() => canvasRef.current && shareOrDownload(canvasRef.current, `${brand.short.toLowerCase()}-progress.png`)}
        className="mt-5 w-full"
      >
        <IconShare width={15} height={15} /> Share or save
      </PrimaryButton>

      <h2 className="mt-10 text-[12px] font-medium uppercase tracking-wide text-text-tertiary">Scan history</h2>
      <div className="mt-3 flex flex-col gap-2">
        {scans.map((s) => (
          <Card key={s.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px]">
              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-[12px] text-text-tertiary">{s.topPriorities.length} priorities noted</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
