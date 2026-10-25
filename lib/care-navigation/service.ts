import {
  ALLOWED_MODELS,
  DEFAULT_MODEL,
  MAX_INPUT_CHARS,
} from "./constants";
import { CareNavError, USER_MESSAGES } from "./errors";
import { buildMessages } from "./prompt";
import { postprocess, urgentGuardResult } from "./postprocess";
import { callSarvam } from "./sarvam";
import {
  RequestSchema,
  WireSchema,
  type ApiErrorCode,
  type ApiResponse,
} from "./schema";
import { detectUrgent, sanitizeInput } from "./safety";

export interface ServiceDeps {
  env: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}
export interface ServiceReply {
  status: number;
  body: ApiResponse;
}

const fail = (code: ApiErrorCode, status: number): ServiceReply => ({
  status,
  body: { ok: false, error: { code, message: USER_MESSAGES[code] } },
});

function resolveKey(env: ServiceDeps["env"]): string | null {
  const key = env.SARVAM_API_KEY?.trim();
  if (!key || /^(your[-_ ]?key|changeme|xxx+|placeholder)/i.test(key)) return null;
  return key;
}

function resolveModel(env: ServiceDeps["env"]): string | null {
  const m = env.SARVAM_MODEL?.trim() || DEFAULT_MODEL;
  return (ALLOWED_MODELS as readonly string[]).includes(m) ? m : null;
}

/**
 * Orchestrates: validate -> deterministic safety screen -> Sarvam call ->
 * runtime validation -> grounding/safety post-processing -> final validation.
 * Logs only error codes + a request id (never user text, keys or provider bodies).
 */
export async function runCareNavigation(body: unknown, deps: ServiceDeps): Promise<ServiceReply> {
  const requestId = Math.random().toString(36).slice(2, 10);
  try {
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) return fail("INVALID_INPUT", 400);
    if (parsed.data.text.length > MAX_INPUT_CHARS) return fail("INPUT_TOO_LARGE", 413);

    const text = sanitizeInput(parsed.data.text);
    if (text.length === 0) return fail("INVALID_INPUT", 400);

    // Deterministic urgent-concern guard: no AI call, no triage, just direction to help.
    if (detectUrgent(text)) {
      return {
        status: 200,
        body: { ok: true, source: "safety-guard", model: null, result: urgentGuardResult(), warnings: [] },
      };
    }

    const apiKey = resolveKey(deps.env);
    const model = resolveModel(deps.env);
    if (!apiKey || !model) throw new CareNavError("AI_NOT_CONFIGURED", 503);

    const raw = await callSarvam({
      apiKey,
      model,
      messages: buildMessages(text),
      fetchImpl: deps.fetchImpl,
      timeoutMs: deps.timeoutMs,
    });

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new CareNavError("AI_INVALID_OUTPUT", 502);
    }
    const wire = WireSchema.safeParse(json);
    if (!wire.success) throw new CareNavError("AI_INVALID_OUTPUT", 502);

    const { result, warnings } = postprocess(wire.data, text);
    return { status: 200, body: { ok: true, source: "sarvam-live", model, result, warnings } };
  } catch (err) {
    const e =
      err instanceof CareNavError ? err : new CareNavError("AI_PROVIDER_ERROR", 502);
    // Safe log: code/status/request id only.
    if (e.code !== "AI_NOT_CONFIGURED") {
      console.error("[care-navigation]", { requestId, code: e.code, status: e.status });
    }
    return fail(e.code, e.status);
  }
}
