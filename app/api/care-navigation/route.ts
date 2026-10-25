import { MAX_INPUT_CHARS } from "@/lib/care-navigation/constants";
import { USER_MESSAGES } from "@/lib/care-navigation/errors";
import { CareNavError } from "@/lib/care-navigation/errors";
import { authorizeDemo, consumeDemoQuota } from "@/lib/care-navigation/demoAccess";
import { RequestSchema } from "@/lib/care-navigation/schema";
import { runCareNavigation } from "@/lib/care-navigation/service";
import type { ApiFailure } from "@/lib/care-navigation/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const errorResponse = (code: ApiFailure["error"]["code"], status: number) =>
  Response.json(
    { ok: false, error: { code, message: USER_MESSAGES[code] } } satisfies ApiFailure,
    { status, headers: { "Cache-Control": "no-store" } }
  );

export async function POST(req: Request) {
  try {
    const mode = authorizeDemo(req, process.env);
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return errorResponse("INVALID_INPUT", 400);
    // Reject cross-origin browser submissions; same-origin and command-line judges
    // still require the code. No permissive CORS headers are emitted.
    const origin = req.headers.get("origin");
    // Next may use an internal loopback hostname in req.url. Host is the browser's
    // destination host; do not trust a caller-supplied forwarded-host header.
    if (origin) {
      const expectedHost = req.headers.get("host") ?? new URL(req.url).host;
      const source = new URL(origin);
      if (!["http:", "https:"].includes(source.protocol) || source.host !== expectedHost) return errorResponse("DEMO_UNAUTHORIZED", 401);
    }
    const maxBytes = MAX_INPUT_CHARS * 6 + 1000;
    if (Number(req.headers.get("content-length")) > maxBytes) return errorResponse("INPUT_TOO_LARGE", 413);
    const reader = req.body?.getReader();
    if (!reader) return errorResponse("INVALID_INPUT", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    const timer = setTimeout(() => { void reader.cancel(); }, 5000);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > maxBytes) { await reader.cancel(); return errorResponse("INPUT_TOO_LARGE", 413); }
        chunks.push(value);
      }
    } finally { clearTimeout(timer); reader.releaseLock(); }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return errorResponse("INVALID_INPUT", 400); }
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success || !parsed.data.text.trim()) return errorResponse("INVALID_INPUT", 400);
    if (parsed.data.text.length > MAX_INPUT_CHARS) return errorResponse("INPUT_TOO_LARGE", 413);
    await consumeDemoQuota(req, process.env, mode);
    const { status, body: out } = await runCareNavigation(body, { env: process.env });
    return Response.json(out, { status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof CareNavError) return errorResponse(err.code, err.status);
    return errorResponse("INVALID_INPUT", 400);
  }
}

// Only POST is supported.
export async function GET() {
  return Response.json({ ok: false, error: { code: "INVALID_INPUT", message: "Use POST." } }, { status: 405, headers: { Allow: "POST" } });
}
