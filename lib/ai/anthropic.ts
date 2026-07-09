const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export const MODELS = {
  default: "claude-sonnet-5",
  light: "claude-haiku-4-5-20251001",
  heavy: "claude-opus-4-8",
} as const;

export interface ImageBlock {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp"; data: string };
}
export interface TextBlock {
  type: "text";
  text: string;
}
export type ContentBlock = TextBlock | ImageBlock;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

function apiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not configured on the server");
  }
  return key;
}

export class ClaudeApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function callClaude(opts: {
  model?: string;
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
}): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? MODELS.default,
      system: opts.system,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new ClaudeApiError(res.status, `Anthropic API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
  return text;
}

// Re-emits Anthropic's SSE text deltas as a plain UTF-8 text stream, so the
// client can read the response body directly without an SSE parser.
export async function streamClaudeText(opts: {
  model?: string;
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? MODELS.default,
      system: opts.system,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new ClaudeApiError(res.status, `Anthropic API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const upstream = res.body;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(evt.delta.text));
              }
            } catch {
              // ignore malformed SSE fragment
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

// Claude sometimes wraps JSON in prose or ```json fences despite instructions.
// Pull out the first balanced {...} or [...] block.
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model response");
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1));
      }
    }
  }
  throw new Error("Unbalanced JSON in model response");
}
