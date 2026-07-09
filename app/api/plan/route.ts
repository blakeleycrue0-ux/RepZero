import { NextRequest, NextResponse } from "next/server";
import { callClaude, extractJson, ClaudeApiError, MODELS } from "@/lib/ai/anthropic";
import { planSystem, planUserPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, clientIdFrom, logAiRequest } from "@/lib/ai/ratelimit";
import { MUSCLE_GROUPS } from "@/lib/store/types";
import type { Profile } from "@/lib/store/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = clientIdFrom(req);
  const limited = checkRateLimit(clientId);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.message }, { status: limited.status });
  }

  let body: { profile?: Profile; priorities?: string[]; regenerateNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const profile = body.profile;
  if (!profile || !profile.goal || !profile.experience || !profile.equipment || !profile.daysPerWeek) {
    return NextResponse.json({ error: "A complete profile is required" }, { status: 400 });
  }

  try {
    const text = await callClaude({
      model: MODELS.default,
      system: planSystem(),
      messages: [
        { role: "user", content: planUserPrompt(profile, body.priorities ?? null, body.regenerateNote) },
      ],
      maxTokens: 3000,
    });

    const parsed = extractJson(text) as {
      summary?: string;
      days?: {
        day: string;
        name: string;
        isRest: boolean;
        focus: string[];
        exercises: { name: string; sets: number; reps: string; rpe: string; targets: string[]; notes?: string }[];
      }[];
    };

    const validGroups = new Set(MUSCLE_GROUPS);
    const days = (parsed.days ?? []).map((d) => ({
      day: d.day,
      name: d.name,
      isRest: !!d.isRest,
      focus: (d.focus ?? []).filter((f) => validGroups.has(f as (typeof MUSCLE_GROUPS)[number])),
      exercises: (d.exercises ?? []).map((e) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rpe: e.rpe,
        notes: e.notes,
        targets: (e.targets ?? []).filter((t) => validGroups.has(t as (typeof MUSCLE_GROUPS)[number])),
      })),
    }));

    if (days.length === 0) throw new Error("Model returned an empty plan");

    logAiRequest({ route: "plan", clientId, status: 200, ms: Date.now() - start });
    return NextResponse.json({ summary: parsed.summary ?? "", days });
  } catch (err) {
    const status = err instanceof ClaudeApiError ? err.status : 502;
    logAiRequest({ route: "plan", clientId, status, ms: Date.now() - start });
    console.error("plan error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't generate a plan just now. Try again." }, { status: 502 });
  }
}
