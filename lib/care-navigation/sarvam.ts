import {
  PROVIDER_MAX_TOKENS,
  PROVIDER_TIMEOUT_MS,
  SARVAM_ENDPOINT,
} from "./constants";
import { CareNavError } from "./errors";
import { WIRE_JSON_SCHEMA } from "./schema";

type FetchLike = typeof fetch;

export interface SarvamCallOptions {
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

/**
 * Calls Sarvam Chat Completions (V1) with strict JSON-schema structured output.
 * SERVER-SIDE ONLY. Returns the raw assistant `content` string (JSON text).
 * Throws CareNavError with a safe code; never includes provider bodies/keys.
 */
export async function callSarvam(opts: SarvamCallOptions): Promise<string> {
  const doFetch = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? PROVIDER_TIMEOUT_MS);

  let res: Response;
  let payload: unknown;
  try {
    res = await doFetch(SARVAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": opts.apiKey,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: 0.1,
        max_tokens: PROVIDER_MAX_TOKENS,
        // Thinking mode is on by default and can consume max_tokens before any
        // JSON is produced; extraction doesn't need it. null disables it (Sarvam docs).
        reasoning_effort: null,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "care_navigation_extraction",
            strict: true,
            schema: WIRE_JSON_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 429) throw new CareNavError("AI_RATE_LIMITED", 429);
      if (res.status === 401 || res.status === 403) throw new CareNavError("AI_AUTH_FAILED", 502);
      throw new CareNavError("AI_PROVIDER_ERROR", 502);
    }
    try { payload = await res.json(); }
    catch (err) {
      if ((err as { name?: string })?.name === "AbortError") throw err;
      throw new CareNavError("AI_INVALID_OUTPUT", 502);
    }
  } catch (err) {
    if (err instanceof CareNavError) throw err;
    if ((err as { name?: string })?.name === "AbortError") {
      throw new CareNavError("AI_TIMEOUT", 504);
    }
    throw new CareNavError("AI_PROVIDER_ERROR", 502);
  } finally {
    clearTimeout(timer);
  }

  const choice = (payload as { choices?: unknown[] })?.choices?.[0] as
    | { finish_reason?: string; message?: { content?: unknown } }
    | undefined;
  const content = choice?.message?.content;

  // finish_reason "length" => truncated JSON (or reasoning consumed the budget).
  if (!choice || choice.finish_reason === "length" || choice.finish_reason === "content_filter") {
    throw new CareNavError("AI_INVALID_OUTPUT", 502);
  }
  if (typeof content !== "string" || content.trim() === "") {
    throw new CareNavError("AI_INVALID_OUTPUT", 502);
  }
  return content;
}
