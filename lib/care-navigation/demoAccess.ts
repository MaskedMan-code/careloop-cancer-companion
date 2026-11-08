import { CareNavError } from "./errors";
import { checkRateLimit } from "./rateLimit";

type Env = Record<string, string | undefined>;
// Atomic shared quotas. All judges/instances share one budget; rotating the access
// code does not reset it. No source text, IP addresses or credentials enter Redis.
export const QUOTA_SCRIPT = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local daily = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= tonumber(ARGV[1]) or daily >= tonumber(ARGV[2]) then return 0 end
local m = redis.call('INCR', KEYS[1])
if m == 1 then redis.call('EXPIRE', KEYS[1], 60) end
local d = redis.call('INCR', KEYS[2])
if d == 1 then redis.call('EXPIRE', KEYS[2], 172800) end
return 1`;

function localBypass(req: Request, env: Env) {
  const hostname = new URL(req.url).hostname;
  return env.CARELOOP_LOCAL_DEMO === "1" && !env.VERCEL && ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

// Anonymous public demo. Shared Redis quotas remain mandatory to protect AI credits.
export function authorizeDemo(req: Request, env: Env): "local" | "public" {
  return localBypass(req, env) ? "local" : "public";
}

export async function consumeDemoQuota(req: Request, env: Env, mode: "local" | "public", fetchImpl: typeof fetch = fetch, now = new Date()) {
  if (mode === "local") {
    // Loopback-only convenience guard, explicitly NOT the public security control.
    if (!checkRateLimit("local-demo")) throw new CareNavError("RATE_LIMITED", 429);
    return;
  }
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  const daily = Number(env.CARELOOP_AI_DAILY_LIMIT ?? "100");
  // Safe diagnostics only: never log secrets, user input or request headers.
  const configError = !url ? "redis_url_missing"
    : !/^https:\/\/[a-z0-9-]+\.upstash\.io\/?$/i.test(url) ? "redis_url_invalid"
    : !token ? "redis_token_missing"
    : !Number.isInteger(daily) || daily < 1 || daily > 1000 ? "daily_limit_invalid"
    : null;
  if (configError) {
    console.error("[CareLoop quota] " + configError);
    throw new CareNavError("DEMO_PROTECTION_UNAVAILABLE", 503);
  }
  const controller = new AbortController();
  // Explicit guard lets TypeScript narrow Redis settings before fetch.
  // The earlier config validation already emits non-secret diagnostics.
  if (!url || !token) throw new CareNavError("DEMO_PROTECTION_UNAVAILABLE", 503);
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetchImpl(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", QUOTA_SCRIPT, 2, "careloop:{ai}:minute", `careloop:{ai}:day:${now.toISOString().slice(0, 10)}`, 10, daily]),
      signal: controller.signal, cache: "no-store" });
    if (!res.ok) {
      console.error("[CareLoop quota] redis_http_" + res.status);
      throw new Error("quota service");
    }
    const data: unknown = await res.json();
    if (!data || typeof data !== "object" || !("result" in data) || ("error" in data && data.error) || ![0, 1].includes(data.result as number)) throw new Error("quota response");
    if (data.result === 0) throw new CareNavError("RATE_LIMITED", 429);
  } catch (err) {
    if (err instanceof CareNavError) throw err;
    console.error("[CareLoop quota] redis_request_or_response_failed");
    throw new CareNavError("DEMO_PROTECTION_UNAVAILABLE", 503);
  } finally { clearTimeout(timer); }
}
