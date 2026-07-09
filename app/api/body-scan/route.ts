import { NextRequest, NextResponse } from "next/server";
import { callClaude, extractJson, ClaudeApiError, MODELS, type ContentBlock } from "@/lib/ai/anthropic";
import { BODY_SCAN_SYSTEM } from "@/lib/ai/prompts";
import { checkRateLimit, clientIdFrom, logAiRequest } from "@/lib/ai/ratelimit";
import { MUSCLE_GROUPS } from "@/lib/store/types";

export const runtime = "nodejs";

const MAX_IMAGES = 3;
const MAX_BASE64_CHARS = 7_000_000; // ~5MB raw per image
const ALLOWED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp"]);

interface IncomingImage {
  dataUrl: string;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = clientIdFrom(req);
  const limited = checkRateLimit(clientId);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.message }, { status: limited.status });
  }

  let body: { images?: IncomingImage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const images = body.images ?? [];
  if (images.length === 0) {
    return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Send at most ${MAX_IMAGES} photos` }, { status: 400 });
  }

  const blocks: ContentBlock[] = [];
  for (const img of images) {
    const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(img.dataUrl ?? "");
    if (!match) {
      return NextResponse.json({ error: "Photos must be base64 image data URLs" }, { status: 400 });
    }
    const [, mediaType, data] = match;
    if (!ALLOWED_MEDIA.has(mediaType)) {
      return NextResponse.json({ error: "Photos must be JPEG, PNG, or WebP" }, { status: 400 });
    }
    if (data.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "Each photo must be under ~5MB" }, { status: 400 });
    }
    blocks.push({
      type: "image",
      source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data },
    });
  }
  blocks.push({
    type: "text",
    text: "Analyze these physique photos and return the muscle-group ratings JSON described in your instructions.",
  });

  try {
    const text = await callClaude({
      model: MODELS.default,
      system: BODY_SCAN_SYSTEM,
      messages: [{ role: "user", content: blocks }],
      maxTokens: 1500,
    });

    const parsed = extractJson(text) as {
      groups?: { id: string; rating: string; note: string }[];
      summary?: string;
      top_priorities?: string[];
    };

    const validGroups = new Set(MUSCLE_GROUPS);
    const groups = (parsed.groups ?? []).filter(
      (g) => validGroups.has(g.id as (typeof MUSCLE_GROUPS)[number]) && ["developing", "solid", "strong"].includes(g.rating)
    );
    if (groups.length < MUSCLE_GROUPS.length) {
      throw new Error("Model returned an incomplete set of muscle groups");
    }

    logAiRequest({ route: "body-scan", clientId, status: 200, ms: Date.now() - start });
    return NextResponse.json({
      groups,
      summary: parsed.summary ?? "",
      topPriorities: (parsed.top_priorities ?? []).filter((p) => validGroups.has(p as (typeof MUSCLE_GROUPS)[number])),
    });
    // Note: `images`/`blocks` hold the only copy of the photo bytes and go out
    // of scope here — nothing is written to disk or a database.
  } catch (err) {
    const status = err instanceof ClaudeApiError ? err.status : 502;
    logAiRequest({ route: "body-scan", clientId, status, ms: Date.now() - start });
    console.error("body-scan error", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "We couldn't read that scan. Try again with clearer, well-lit photos." },
      { status: 502 }
    );
  }
}
