import fs from "node:fs";
import path from "node:path";

// Minimal .env loader for the live suite (never prints values).
for (const name of [".env.local", ".env"]) {
  const p = path.resolve(process.cwd(), name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const v = m[2].replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined && v !== "") process.env[m[1]] = v;
  }
}
