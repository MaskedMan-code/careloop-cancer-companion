import { expect } from "vitest";
import { runCareNavigation, type ServiceReply } from "@/lib/care-navigation/service";
import { FinalResultSchema } from "@/lib/care-navigation/schema";
import { quoteInSource } from "@/lib/care-navigation/postprocess";
import {
  MESSAGES,
  containsClinicalClaim,
  detectClinicalFinding,
  detectInjection,
  looksLikeClinicalInstruction,
  normalizeForMatch,
  sanitizeInput,
} from "@/lib/care-navigation/safety";
import type { Case, Expect, MockProvider } from "../fixtures/care-navigation-cases";

export const TEST_KEY = "test-key-not-real";

export interface FetchCall { url: string; init: RequestInit }

export function makeFetch(mock: MockProvider) {
  const calls: FetchCall[] = [];
  const impl = (async (url: unknown, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    switch (mock.kind) {
      case "none":
        throw new Error("Provider must not be called for this case");
      case "http":
        return new Response(mock.body ?? "", { status: mock.status });
      case "timeout":
        return new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
          );
        });
      case "raw":
        return Response.json({
          choices: [{ index: 0, finish_reason: mock.finishReason ?? "stop", message: { role: "assistant", content: mock.content } }],
        });
      case "output":
        return Response.json({
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(mock.wire) } }],
        });
    }
  }) as typeof fetch;
  return { impl, calls };
}

export async function runMockedCase(c: Case) {
  const { impl, calls } = makeFetch(c.mock);
  const env = c.env === "no-key" ? {} : { SARVAM_API_KEY: TEST_KEY, SARVAM_MODEL: "sarvam-105b" };
  const reply = await runCareNavigation({ text: c.input }, {
    env,
    fetchImpl: impl,
    timeoutMs: c.mock.kind === "timeout" ? 40 : undefined,
  });
  return { reply, calls };
}

/** Properties that must hold for ANY successful response, whichever model produced it. */
export function assertUniversalInvariants(reply: ServiceReply, input: string) {
  const serialized = JSON.stringify(reply.body);
  expect(serialized).not.toContain(TEST_KEY);
  expect(serialized).not.toMatch(/SECRET-PROVIDER-DETAIL|sk_live_/);
  if (!reply.body.ok) return;

  const { result, warnings, source } = reply.body;
  expect(FinalResultSchema.safeParse(result).success).toBe(true);
  expect(result.safe_message.length).toBeGreaterThan(0);
  expect(containsClinicalClaim(result.summary)).toBe(false);
  expect(Array.isArray(warnings)).toBe(true);

  const normSource = normalizeForMatch(sanitizeInput(input));
  for (const t of result.tasks) {
    expect(Object.keys(t)).not.toContain("done");
    expect(Object.keys(t)).not.toContain("completed");
    expect(looksLikeClinicalInstruction(t.label)).toBe(false);
    expect(detectClinicalFinding(t.label)).toBe(false);
    expect(detectInjection(t.label)).toBe(false);
    if (t.origin === "explicit") {
      expect(t.source_quote).not.toBeNull();
      expect(quoteInSource(t.source_quote!, normSource)).toBe(true);
    } else {
      expect(t.source_quote).toBeNull();
      expect(/\d/.test(t.label)).toBe(false);
    }
  }
  for (const fact of Object.values(result.appointment)) {
    if (fact) expect(quoteInSource(fact.source_quote, normSource)).toBe(true);
  }
  if (source === "safety-guard") expect(result.tasks).toHaveLength(0);
}

export function assertExpect(reply: ServiceReply, calls: FetchCall[] | null, e: Expect) {
  if (e.status !== undefined) expect(reply.status).toBe(e.status);
  if (e.ok !== undefined) expect(reply.body.ok).toBe(e.ok);
  if (e.providerCalled !== undefined && calls) expect(calls.length > 0).toBe(e.providerCalled);

  if (!reply.body.ok) {
    if (e.errorCode) expect(reply.body.error.code).toBe(e.errorCode);
    return;
  }
  const { result, warnings, source } = reply.body;
  if (e.source) expect(source).toBe(e.source);
  const labels = result.tasks.map((t) => t.label);
  if (e.minTasks !== undefined) expect(result.tasks.length).toBeGreaterThanOrEqual(e.minTasks);
  if (e.maxTasks !== undefined) expect(result.tasks.length).toBeLessThanOrEqual(e.maxTasks);
  if (e.maxExplicitTasks !== undefined)
    expect(result.tasks.filter((t) => t.origin === "explicit").length).toBeLessThanOrEqual(e.maxExplicitTasks);
  for (const r of e.tasksInclude ?? []) expect(labels.some((l) => r.test(l))).toBe(true);
  for (const r of e.tasksExclude ?? []) expect(labels.some((l) => r.test(l))).toBe(false);
  for (const [field, present] of Object.entries(e.facts ?? {})) {
    const fact = result.appointment[field as keyof typeof result.appointment];
    expect(fact !== null, `fact "${field}" presence`).toBe(present);
  }
  for (const r of e.missingTopics ?? []) {
    expect(result.missing_or_ambiguous.some((m) => r.test(m.topic)), `missing topic ${r}`).toBe(true);
  }
  for (const [k, v] of Object.entries(e.clinical ?? {})) {
    expect(result.clinical[k as keyof typeof result.clinical], `clinical.${k}`).toBe(v);
  }
  if (e.safeMessage) expect(result.safe_message).toBe(MESSAGES[e.safeMessage]);
  for (const r of e.warnings ?? []) expect(warnings.some((w) => r.test(w)), `warning ${r}`).toBe(true);
  if (e.language) expect(result.language_detected).toBe(e.language);
  for (const r of e.summaryExcludes ?? []) expect(r.test(result.summary)).toBe(false);
}
