import { defineConfig } from "vitest/config";
import path from "node:path";

// Offline suite: no network, no credits, no API key required.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["tests/offline/**/*.test.ts"],
    testTimeout: 10_000,
  },
});
