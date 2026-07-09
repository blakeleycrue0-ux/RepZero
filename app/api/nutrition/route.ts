import { NextRequest, NextResponse } from "next/server";
import { callClaude, extractJson, ClaudeApiError, MODELS } from "@/lib/ai/anthropic";
import { NUTRITION_SYSTEM, nutritionUserPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, clientIdFrom, logAiRequest } from "@/lib/ai/ratelimit";
import type { Profile } from "@/lib/store/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = clientIdFrom(req);
  const limited = checkRateLimit(clientId);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.message }, { status: limited.status });
  }

  let body: { profile?: Profile };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const profile = body.profile;
  if (!profile || !profile.goal || !profile.dietPattern) {
    return NextResponse.json({ error: "A complete profile is required" }, { status: 400 });
  }

  try {
    const text = await callClaude({
      model: MODELS.default,
      system: NUTRITION_SYSTEM,
      messages: [{ role: "user", content: nutritionUserPrompt(profile) }],
      maxTokens: 1500,
    });

    const parsed = extractJson(text) as {
      targetCalories?: number;
      macros?: { protein: number; carbs: number; fat: number };
      meals?: { name: string; description: string; items: string[] }[];
      notes?: string;
    };

    if (!parsed.targetCalories || !parsed.macros || !parsed.meals?.length) {
      throw new Error("Model returned incomplete nutrition guidance");
    }

    logAiRequest({ route: "nutrition", clientId, status: 200, ms: Date.now() - start });
    return NextResponse.json({
      targetCalories: parsed.targetCalories,
      macros: parsed.macros,
      meals: parsed.meals,
      notes: parsed.notes ?? "",
    });
  } catch (err) {
    const status = err instanceof ClaudeApiError ? err.status : 502;
    logAiRequest({ route: "nutrition", clientId, status, ms: Date.now() - start });
    console.error("nutrition error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't generate guidance just now. Try again." }, { status: 502 });
  }
}
