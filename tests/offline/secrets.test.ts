import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const SCAN_DIRS = ["app", "lib", "components", "docs", "e2e"];
const SCAN_FILES = ["README.md", ".env.example", ".gitignore", "package.json", "next.config.mjs"];

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs|md|json|css|svg|py)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = [
  ...SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d))),
  ...SCAN_FILES.map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f)),
];
const rel = (f: string) => path.relative(ROOT, f).replace(/\\/g, "/");

describe("secret hygiene", () => {
  it("contains no hard-coded Sarvam-style keys", () => {
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      expect(text, rel(f)).not.toMatch(/\bsk_[A-Za-z0-9]{16,}\b/);
      expect(text, rel(f)).not.toMatch(/api-subscription-key["']?\s*[:=]\s*["'][A-Za-z0-9_-]{12,}["']/);
    }
  });

  it(".env.example has placeholders only", () => {
    const env = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
    expect(env).toMatch(/^SARVAM_API_KEY=\s*$/m);
    expect(env).toMatch(/^SARVAM_MODEL=sarvam-105b\s*$/m);
  });

  it(".gitignore excludes env/secret files but keeps .env.example", () => {
    const g = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8").split("\n").map((l) => l.trim());
    for (const needle of [".env", ".env.local", ".env.*.local", "*.pem", ".vercel"]) expect(g, needle).toContain(needle);
    expect(g).toContain("!.env.example");
  });

  it("the source exporter excludes environment files and generated output by allow-list", () => {
    const exporter = fs.readFileSync(path.join(ROOT, "scripts/export-source.py"), "utf8");
    expect(exporter).toContain('".env.example"');
    expect(exporter).toContain('ALLOWED_DIRS');
    expect(exporter).not.toContain('read_text');
  });

  it("client components never reference Sarvam, the key, or server-only modules", () => {
    const clientFiles = files.filter((f) => /\.(ts|tsx)$/.test(f) && /^\s*["']use client["']/.test(fs.readFileSync(f, "utf8")));
    expect(clientFiles.length).toBeGreaterThan(5);
    for (const f of clientFiles) {
      const text = fs.readFileSync(f, "utf8");
      expect(text, rel(f)).not.toMatch(/SARVAM|api\.sarvam\.ai|api-subscription-key|process\.env/);
      expect(text, rel(f)).not.toMatch(/care-navigation\/(sarvam|service|prompt|postprocess|safety|rateLimit)/);
    }
  });

  it("only the server route/service reads the key from the environment", () => {
    const readers = files.filter((f) => /\.(ts|tsx)$/.test(f) && /process\.env/.test(fs.readFileSync(f, "utf8"))).map(rel);
    expect(readers.sort()).toEqual(["app/api/care-navigation/route.ts"]);
  });
});
