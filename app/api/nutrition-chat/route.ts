import { NextRequest } from "next/server";
import { streamClaudeText, ClaudeApiError, MODELS, type ClaudeMessage } from "@/lib/ai/anthropic";
import { NUTRITION_CHAT_SYSTEM, nutritionContext } from "@/lib/ai/prompts";
import { checkRateLimit, clientIdFrom, logAiRequest } from "@/lib/ai/ratelimit";
import type { Profile } from "@/lib/store/types";

export const runtime = "nodejs";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const clientId = clientIdFrom(req);
  const limited = checkRateLimit(clientId);
  if (!limited.ok) {
    return new Response(limited.message, { status: limited.status });
  }

  let body: { profile?: Profile | null; planNotes?: string | null; messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-20);
  if (messages.length === 0) {
    return new Response("At least one message is required", { status: 400 });
  }

  const claudeMessages: ClaudeMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
  const system = `${NUTRITION_CHAT_SYSTEM}\n\n${nutritionContext(body.profile ?? null, body.planNotes ?? null)}`;

  try {
    const stream = await streamClaudeText({
      model: MODELS.default,
      system,
      messages: claudeMessages,
      maxTokens: 900,
    });
    logAiRequest({ route: "nutrition-chat", clientId, status: 200, ms: Date.now() - start });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const status = err instanceof ClaudeApiError ? err.status : 502;
    logAiRequest({ route: "nutrition-chat", clientId, status, ms: Date.now() - start });
    console.error("nutrition-chat error", err instanceof Error ? err.message : err);
    return new Response("Nutrition chat is unavailable right now. Try again in a moment.", { status: 502 });
  }
}
