import { defineConfig } from "vitest/config";
import path from "node:path";

// Live suite: calls the REAL Sarvam API and CONSUMES CREDITS.
// Runs only when RUN_LIVE_TESTS=1 and SARVAM_API_KEY is set (see tests/live).
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["tests/live/**/*.live.test.ts"],
    setupFiles: ["tests/live/loadEnv.ts"],
    testTimeout: 90_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
