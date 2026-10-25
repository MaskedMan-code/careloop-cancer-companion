import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/care-navigation/route";
import { MAX_INPUT_CHARS, RATE_LIMIT_PER_MINUTE } from "@/lib/care-navigation/constants";
import { resetRateLimit } from "@/lib/care-navigation/rateLimit";
import { CASES } from "../fixtures/care-navigation-cases";
import { TEST_KEY, makeFetch } from "../helpers/harness";

const ok = CASES.find((c) => c.id === "clear-appointment-en")!;
const post = (body: string, ip = "10.0.0.1") =>
  POST(new Request("http://localhost/api/care-navigation", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body,
  }));

beforeEach(() => { resetRateLimit(); vi.stubEnv("CARELOOP_LOCAL_DEMO", "1"); vi.stubEnv("VERCEL", ""); vi.stubEnv("SARVAM_API_KEY", ""); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("POST /api/care-navigation", () => {
  it("returns validated structured output with no-store caching (mocked provider)", async () => {
    vi.stubEnv("SARVAM_API_KEY", TEST_KEY);
    const { impl } = makeFetch(ok.mock);
    vi.stubGlobal("fetch", impl);
    const res = await post(JSON.stringify({ text: ok.input }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.source).toBe("sarvam-live");
    expect(json.result.appointment.date.value).toBe("24 September 2026");
    expect(JSON.stringify(json)).not.toContain(TEST_KEY);
  });

  it("rejects invalid JSON, empty text, oversized text and oversized payloads", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post(JSON.stringify({ text: "   " }))).status).toBe(400);
    expect((await post(JSON.stringify({ text: "x".repeat(MAX_INPUT_CHARS + 1) }))).status).toBe(413);
    const huge = JSON.stringify({ text: "x".repeat(MAX_INPUT_CHARS * 7) });
    const res = await post(huge);
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe("INPUT_TOO_LARGE");
  });

  it("reports a clear 'AI unavailable' error when the key is missing — never canned output", async () => {
    vi.stubEnv("SARVAM_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await post(JSON.stringify({ text: ok.input }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("AI_NOT_CONFIGURED");
    expect(json.result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("limits loopback demo attempts in aggregate, even if forwarded IP changes", async () => {
    for (let i = 0; i < RATE_LIMIT_PER_MINUTE; i++) {
      expect((await post(JSON.stringify({ text: ok.input }), "9.9.9.9")).status).toBe(503);
    }
    expect((await post(JSON.stringify({ text: ok.input }), "9.9.9.9")).status).toBe(429);
    expect((await post(JSON.stringify({ text: ok.input }), "8.8.8.8")).status).toBe(429);
  });

  it("does not log user text, API keys or provider bodies on failure", async () => {
    vi.stubEnv("SARVAM_API_KEY", TEST_KEY);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", makeFetch({ kind: "http", status: 503, body: "SECRET-PROVIDER-DETAIL" }).impl);
    const secretText = "Patient Ayesha Khan appointment 24 September PRIVATE-MARKER-123";
    const res = await post(JSON.stringify({ text: secretText }));
    expect(res.status).toBe(502);
    const logged = JSON.stringify([...errSpy.mock.calls, ...logSpy.mock.calls]);
    expect(logged).toContain("AI_PROVIDER_ERROR");
    expect(logged).not.toMatch(/PRIVATE-MARKER|Ayesha|SECRET-PROVIDER-DETAIL/);
    expect(logged).not.toContain(TEST_KEY);
    expect(JSON.stringify(await res.json())).not.toMatch(/SECRET-PROVIDER-DETAIL|PRIVATE-MARKER/);
  });

  it("only supports POST", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });
});
