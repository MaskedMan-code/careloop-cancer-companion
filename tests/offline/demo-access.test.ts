import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/care-navigation/route";
import { authorizeDemo, consumeDemoQuota, QUOTA_SCRIPT } from "@/lib/care-navigation/demoAccess";
import { resetRateLimit } from "@/lib/care-navigation/rateLimit";
import { CASES } from "../fixtures/care-navigation-cases";
import { makeFetch, TEST_KEY } from "../helpers/harness";

const code = "fictional-test-access-token-32-characters";
const env = { CARELOOP_DEMO_ACCESS_CODE: code, UPSTASH_REDIS_REST_URL: "https://fictional.upstash.io", UPSTASH_REDIS_REST_TOKEN: "test-redis-token", CARELOOP_AI_DAILY_LIMIT: "2" };
function request(access = code, extra: Record<string, string> = {}) { return new Request("https://careloop.example/api/care-navigation", { method: "POST", headers: { "content-type": "application/json", "x-careloop-access-code": access, ...extra }, body: JSON.stringify({ text: "Bring appointment slip" }) }); }
beforeEach(() => { for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value); vi.stubEnv("CARELOOP_LOCAL_DEMO", ""); vi.stubEnv("VERCEL", "1"); vi.stubEnv("SARVAM_API_KEY", TEST_KEY); resetRateLimit(); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("public judge access and durable quotas", () => {
  it("rejects missing/wrong codes before any quota or provider request", async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal("fetch", fetchSpy);
    for (const access of ["", "wrong", "x".repeat(257)]) { const res = await POST(request(access)); expect(res.status).toBe(401); expect((await res.json()).error.code).toBe("DEMO_UNAUTHORIZED"); }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("fails closed for missing or weak public access configuration", async () => {
    for (const value of ["", "weak"]) { vi.stubEnv("CARELOOP_DEMO_ACCESS_CODE", value); expect((await POST(request())).status).toBe(503); }
  });
  it("ignores local bypass on Vercel and non-loopback origins", () => {
    expect(() => authorizeDemo(request(""), { ...env, CARELOOP_LOCAL_DEMO: "1" })).toThrow();
    const local = new Request("http://localhost/api/care-navigation");
    expect(() => authorizeDemo(local, { ...env, VERCEL: "1", CARELOOP_LOCAL_DEMO: "1" })).toThrow();
    expect(authorizeDemo(local, { CARELOOP_LOCAL_DEMO: "1" })).toBe("local");
  });
  it("fails closed without quota credentials, invalid limits, and on quota network/protocol errors", async () => {
    for (const patch of [{ UPSTASH_REDIS_REST_TOKEN: "" }, { UPSTASH_REDIS_REST_URL: "http://bad.example" }, { CARELOOP_AI_DAILY_LIMIT: "0" }, { CARELOOP_AI_DAILY_LIMIT: "NaN" }]) {
      await expect(consumeDemoQuota(request(), { ...env, ...patch }, "public")).rejects.toMatchObject({ code: "DEMO_PROTECTION_UNAVAILABLE" });
    }
    for (const impl of [vi.fn().mockRejectedValue(new Error("SECRET-QUOTA-ERROR")), vi.fn().mockResolvedValue(new Response("bad json")), vi.fn().mockResolvedValue(Response.json({ result: "1" })), vi.fn().mockResolvedValue(Response.json({ error: "SECRET-QUOTA-ERROR" }))]) {
      vi.stubGlobal("fetch", impl); const res = await POST(request()); expect(res.status).toBe(503); expect(JSON.stringify(await res.json())).not.toContain("SECRET-QUOTA");
    }
  });
  it("uses a single atomic EVAL for global minute + UTC daily budget, without text or code", async () => {
    const impl = vi.fn().mockResolvedValue(Response.json({ result: 1 }));
    await consumeDemoQuota(request(), env, "public", impl, new Date("2026-10-25T23:59:00Z"));
    const [url, init] = impl.mock.calls[0]; expect(url).toBe(env.UPSTASH_REDIS_REST_URL);
    const command = JSON.parse(init.body);
    expect(command).toEqual(["EVAL", QUOTA_SCRIPT, 2, "careloop:{ai}:minute", "careloop:{ai}:day:2026-10-25", 10, 2]);
    expect(QUOTA_SCRIPT).toMatch(/minute >=/); expect(QUOTA_SCRIPT).toMatch(/daily >=/); expect(QUOTA_SCRIPT).toMatch(/EXPIRE/);
    expect(init.body).not.toContain(code); expect(init.body).not.toContain("appointment slip");
  });
  it("stops provider calls on exhausted quota (shared across requests/instances)", async () => {
    const impl = vi.fn().mockResolvedValue(Response.json({ result: 0 })); vi.stubGlobal("fetch", impl);
    const res = await POST(request()); expect(res.status).toBe(429); expect((await res.json()).error.code).toBe("RATE_LIMITED");
    expect(impl).toHaveBeenCalledTimes(1);
    expect(String(impl.mock.calls[0][0])).toContain("upstash.io");
  });
  it("passes authorized requests through quota to the unchanged Sarvam extraction pipeline", async () => {
    const provider = makeFetch(CASES.find((c) => c.id === "clear-appointment-en")!.mock);
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => String(url).includes("upstash.io") ? Response.json({ result: 1 }) : provider.impl(url, init)));
    const req = new Request(request().url, { method: "POST", headers: request().headers, body: JSON.stringify({ text: CASES.find((c) => c.id === "clear-appointment-en")!.input }) });
    const res = await POST(req); expect(res.status).toBe(200); expect((await res.json()).source).toBe("sarvam-live"); expect(provider.calls).toHaveLength(1);
  });
  it("rejects cross-origin browser submissions and non-JSON requests", async () => {
    expect((await POST(request(code, { origin: "https://untrusted.example" }))).status).toBe(401);
    expect((await POST(request(code, { "content-type": "text/plain" }))).status).toBe(400);
  });
  it("accepts a same-host browser origin even when Next uses an internal request hostname", async () => {
    vi.stubEnv("CARELOOP_LOCAL_DEMO", "1"); vi.stubEnv("VERCEL", ""); vi.stubEnv("SARVAM_API_KEY", "");
    const req = new Request("http://localhost:3411/api/care-navigation", { method: "POST", headers: { host: "127.0.0.1:3411", origin: "http://127.0.0.1:3411", "content-type": "application/json" }, body: JSON.stringify({ text: "Bring appointment slip" }) });
    const res = await POST(req); expect(res.status).toBe(503); expect((await res.json()).error.code).toBe("AI_NOT_CONFIGURED");
  });
});
