import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", testMatch: "**/*.spec.ts", fullyParallel: false, workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3411", channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: {
    command: "node --require ./scripts/no-env-files.cjs ./node_modules/next/dist/bin/next start -p 3411 -H 127.0.0.1",
    url: "http://127.0.0.1:3411", reuseExistingServer: false, timeout: 30_000,
    env: { SARVAM_API_KEY: "", SARVAM_MODEL: "sarvam-105b", CARELOOP_LOCAL_DEMO: "1", VERCEL: "", CARELOOP_DEMO_ACCESS_CODE: "", UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
