// Best-effort in-memory rate limiting, keyed by IP. This resets on cold
// start / across serverless instances — fine for an MVP abuse backstop, not
// a substitute for account-level limits once auth ships.
interface Bucket {
  windowStart: number;
  windowCount: number;
  monthStart: number;
  monthCount: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PER_MONTH = 400;

export function clientIdFrom(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(id: string): { ok: true } | { ok: false; message: string; status: number } {
  const now = Date.now();
  let b = buckets.get(id);
  if (!b) {
    b = { windowStart: now, windowCount: 0, monthStart: now, monthCount: 0 };
    buckets.set(id, b);
  }
  if (now - b.windowStart > WINDOW_MS) {
    b.windowStart = now;
    b.windowCount = 0;
  }
  if (now - b.monthStart > MONTH_MS) {
    b.monthStart = now;
    b.monthCount = 0;
  }
  if (b.windowCount >= MAX_PER_WINDOW) {
    return { ok: false, message: "Too many requests — wait a minute and try again.", status: 429 };
  }
  if (b.monthCount >= MAX_PER_MONTH) {
    return { ok: false, message: "Monthly AI usage limit reached for this device.", status: 429 };
  }
  b.windowCount++;
  b.monthCount++;
  return { ok: true };
}

export function logAiRequest(fields: {
  route: string;
  clientId: string;
  status: number;
  ms: number;
}) {
  // Structured, photo-free logging. Never log request/response bodies here.
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      route: fields.route,
      client: hashId(fields.clientId),
      status: fields.status,
      ms: fields.ms,
    })
  );
}

function hashId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return `c_${(h >>> 0).toString(36)}`;
}
