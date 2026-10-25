/**
 * LIVE tests — call the REAL Sarvam API and CONSUME CREDITS.
 * Opt-in only:   RUN_LIVE_TESTS=1 SARVAM_API_KEY=... npm run test:live
 * (or put SARVAM_API_KEY in .env.local and run:  RUN_LIVE_TESTS=1 npm run test:live)
 * Optional:      LIVE_CASE_FILTER="hindi|injection"   to run a subset.
 *
 * Assertions are invariants + loose expectations only (model output is not
 * bit-reproducible). A pass here is NOT an accuracy score.
 */
import fs from "node:fs";
import path from "node:path";
import { afterAll, describe, it } from "vitest";
import { runCareNavigation } from "@/lib/care-navigation/service";
import { CASES } from "../fixtures/care-navigation-cases";
import { assertExpect, assertUniversalInvariants } from "../helpers/harness";

const RUN = process.env.RUN_LIVE_TESTS === "1" && !!process.env.SARVAM_API_KEY?.trim();
const filter = process.env.LIVE_CASE_FILTER ? new RegExp(process.env.LIVE_CASE_FILTER, "i") : null;
const liveCases = CASES.filter((c) => c.live && (!filter || filter.test(c.id)));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const rows: string[] = [];

describe.skipIf(!RUN)(`LIVE Sarvam care-navigation (${liveCases.length} cases, consumes credits)`, () => {
  for (const c of liveCases) {
    it(`${c.id} — ${c.title}`, async () => {
      const t0 = Date.now();
      let status = "FAIL";
      let detail = "";
      try {
        const reply = await runCareNavigation({ text: c.input }, { env: process.env });
        detail = reply.body.ok ? `ok/${reply.body.source}` : `error/${reply.body.error.code}`;
        assertUniversalInvariants(reply, c.input);
        assertExpect(reply, null, c.expect);
        if (c.liveExpect) assertExpect(reply, null, c.liveExpect);
        status = "PASS";
      } finally {
        rows.push(`| ${c.id} | ${status} | ${detail} | ${Date.now() - t0} ms |`);
        await sleep(750); // be gentle with rate limits
      }
    });
  }

  afterAll(() => {
    const table = ["| Case | Result | Response | Latency |", "|---|---|---|---|", ...rows].join("\n");
    console.log("\nLIVE RESULTS (paste into docs/ai-evaluation.md)\n" + table + "\n");
    fs.mkdirSync(path.resolve("test-results"), { recursive: true });
    fs.writeFileSync(path.resolve("test-results/live-results.md"), table + "\n");
  });
});

describe.skipIf(RUN)("LIVE Sarvam care-navigation", () => {
  it.skip("skipped — set RUN_LIVE_TESTS=1 and SARVAM_API_KEY to run (consumes credits)", () => {});
});
