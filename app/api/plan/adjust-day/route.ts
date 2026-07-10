import { NextRequest, NextResponse } from "next/server";
import { callClaude, extractJson, ClaudeApiError, MODELS } from "@/lib/ai/anthropic";
import { adjustDaySystem, adjustDayUserPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, clientIdFrom, logAiRequest } from "@/lib/ai/ratelimit";
import { MUSCLE_GROUPS } from "@/lib/store/types";
import type { PlanDay, Profile } from "@/lib/store/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = clientIdFrom(req);
  const limited = checkRateLimit(clientId);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.message }, { status: limited.status });
  }

  let body: { profile?: Profile; day?: PlanDay; instruction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const profile = body.profile;
  const day = body.day;
  const instruction = body.instruction?.trim();
  if (!profile || !profile.goal || !profile.experience || !profile.equipment) {
    return NextResponse.json({ error: "A complete profile is required" }, { status: 400 });
  }
  if (!day || day.isRest) {
    return NextResponse.json({ error: "That day can't be adjusted" }, { status: 400 });
  }
  if (!instruction) {
    return NextResponse.json({ error: "Tell the AI what to change" }, { status: 400 });
  }

  try {
    const text = await callClaude({
      model: MODELS.default,
      system: adjustDaySystem(),
      messages: [{ role: "user", content: adjustDayUserPrompt(profile, day, instruction) }],
      maxTokens: 1500,
    });

    const parsed = extractJson(text) as {
      name?: string;
      focus?: string[];
      exercises?: { name: string; sets: number; reps: string; rpe: string; targets: string[]; notes?: string }[];
    };

    const validGroups = new Set(MUSCLE_GROUPS);
    const focus = (parsed.focus ?? []).filter((f) => validGroups.has(f as (typeof MUSCLE_GROUPS)[number]));
    const exercises = (parsed.exercises ?? [])
      .filter((e) => e.name && e.sets > 0 && e.reps && e.rpe)
      .map((e) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rpe: e.rpe,
        notes: e.notes,
        targets: (e.targets ?? []).filter((t) => validGroups.has(t as (typeof MUSCLE_GROUPS)[number])),
      }));

    if (exercises.length === 0) throw new Error("Model returned no valid exercises");

    logAiRequest({ route: "plan-adjust-day", clientId, status: 200, ms: Date.now() - start });
    return NextResponse.json({
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : day.name,
      focus: focus.length ? focus : day.focus,
      exercises,
    });
  } catch (err) {
    const status = err instanceof ClaudeApiError ? err.status : 502;
    logAiRequest({ route: "plan-adjust-day", clientId, status, ms: Date.now() - start });
    console.error("plan adjust-day error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't apply that change just now. Try again." }, { status: 502 });
  }
}
