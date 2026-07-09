"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { ScanResult } from "@/lib/store/types";
import { newId } from "@/lib/id";
import { fileToResizedDataUrl } from "@/lib/image";
import { PrimaryButton, SecondaryButton, Spinner, Card, Tag } from "@/components/ui";
import { IconCamera, IconUpload, IconClose, IconLock } from "@/components/icons";
import BodyMapPanel from "@/components/bodymap/BodyMapPanel";

type SlotKey = "front" | "side" | "back";
const SLOTS: { key: SlotKey; label: string; required: boolean }[] = [
  { key: "front", label: "Front", required: true },
  { key: "side", label: "Side", required: false },
  { key: "back", label: "Back", required: false },
];

export default function ScanPage() {
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [latest, setLatest] = useState<ScanResult | null>(null);
  const [rescanning, setRescanning] = useState(false);

  useEffect(() => {
    getStore()
      .listScans()
      .then((scans) => {
        setLatest(scans[0] ?? null);
        setLoadingHistory(false);
      });
  }, []);

  if (loadingHistory) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  if (latest && !rescanning) {
    return <ScanResultView scan={latest} onRescan={() => setRescanning(true)} />;
  }

  return (
    <ScanCapture
      onDone={(scan) => {
        setLatest(scan);
        setRescanning(false);
      }}
      onCancel={latest ? () => setRescanning(false) : undefined}
    />
  );
}

function ScanResultView({ scan, onRescan }: { scan: ScanResult; onRescan: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] text-text-tertiary">
            Scanned {new Date(scan.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className="mt-1 font-display text-3xl">Your muscle map</h1>
        </div>
        <SecondaryButton onClick={onRescan} className="!px-4 !py-2 text-[13px]">
          Re-scan
        </SecondaryButton>
      </div>

      <Card className="mt-6 p-6">
        <BodyMapPanel groups={scan.groups} />
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">Overview</h2>
        <p className="mt-2 text-[14px] leading-relaxed">{scan.summary}</p>
        <p className="mt-4 text-[12px] leading-relaxed text-text-tertiary">
          A visual estimate for motivation, not a precise medical measurement.
        </p>
      </Card>

      {scan.bodyComposition && (
        <Card className="mt-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
              Body composition
            </h2>
            <Tag
              tone={
                scan.bodyComposition.estimate === "lean"
                  ? "strong"
                  : scan.bodyComposition.estimate === "moderate"
                    ? "solid"
                    : "developing"
              }
            >
              {scan.bodyComposition.estimate === "lean"
                ? "Lean"
                : scan.bodyComposition.estimate === "moderate"
                  ? "Moderate"
                  : "Higher"}
            </Tag>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed">{scan.bodyComposition.note}</p>
          <p className="mt-4 text-[12px] leading-relaxed text-text-tertiary">
            A visual estimate only — not a body-fat scan, DEXA, or medical assessment.
          </p>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/plan" className="flex-1">
          <PrimaryButton className="w-full">Build a plan around this</PrimaryButton>
        </Link>
        <Link href="/progress" className="flex-1">
          <SecondaryButton className="w-full">Share progress card</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}

function ScanCapture({
  onDone,
  onCancel,
}: {
  onDone: (scan: ScanResult) => void;
  onCancel?: () => void;
}) {
  const [images, setImages] = useState<Partial<Record<SlotKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Partial<Record<SlotKey, HTMLInputElement | null>>>({});

  async function handleFile(slot: SlotKey, file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setImages((prev) => ({ ...prev, [slot]: dataUrl }));
    } catch {
      setError("Couldn't read that photo. Try another.");
    }
  }

  const canAnalyze = !!images.front;

  async function analyze() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/body-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          images: Object.values(images)
            .filter(Boolean)
            .map((dataUrl) => ({ dataUrl })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong analyzing your scan.");
      }
      const data = await res.json();
      const scan: ScanResult = {
        id: newId(),
        createdAt: new Date().toISOString(),
        groups: data.groups,
        bodyComposition: data.bodyComposition ?? null,
        summary: data.summary,
        topPriorities: data.topPriorities,
      };
      await getStore().saveScan(scan);
      onDone(scan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:py-12">
      <h1 className="font-display text-3xl">Scan your physique</h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-secondary">
        Add a clear front photo — side and back are optional but sharpen the read. Fitted or no
        shirt, good lighting, standing straight.
      </p>

      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3">
        <IconLock className="mt-0.5 shrink-0 text-text-tertiary" width={15} height={15} />
        <p className="text-[12px] leading-relaxed text-text-secondary">
          Your photos are analyzed and instantly discarded. We never store or view your images —
          only the ratings that come back are saved to your progress.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {SLOTS.map((slot) => (
          <div key={slot.key} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => inputRefs.current[slot.key]?.click()}
              className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface-1"
            >
              {images[slot.key] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[slot.key]} alt={`${slot.label} photo`} className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-text-tertiary">
                  <IconCamera width={20} height={20} />
                  <span className="text-[11px]">{slot.label}{!slot.required && " (optional)"}</span>
                </span>
              )}
              {images[slot.key] && (
                <span
                  role="button"
                  aria-label={`Remove ${slot.label} photo`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages((prev) => {
                      const next = { ...prev };
                      delete next[slot.key];
                      return next;
                    });
                  }}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-paper"
                >
                  <IconClose width={12} height={12} />
                </span>
              )}
            </button>
            <input
              ref={(el) => {
                inputRefs.current[slot.key] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(slot.key, e.target.files?.[0])}
            />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        {onCancel && (
          <SecondaryButton onClick={onCancel} disabled={status === "loading"}>
            Cancel
          </SecondaryButton>
        )}
        <PrimaryButton onClick={analyze} disabled={!canAnalyze || status === "loading"} className="flex-1 sm:flex-none">
          {status === "loading" ? (
            <>
              <Spinner /> Analyzing…
            </>
          ) : (
            <>
              <IconUpload width={15} height={15} /> Analyze scan
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
