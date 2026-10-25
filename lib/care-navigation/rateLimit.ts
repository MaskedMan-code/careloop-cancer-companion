import { RATE_LIMIT_PER_MINUTE } from "./constants";

// Best-effort, per-server-instance limiter. On serverless platforms each instance
// has its own memory, so this is a courtesy guard, NOT a security control.
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, now: number = Date.now()): boolean {
  const windowStart = now - 60_000;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

export function resetRateLimit() {
  hits.clear();
}
