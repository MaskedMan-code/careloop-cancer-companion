import { describe, expect, it } from "vitest";
import { CASES } from "../fixtures/care-navigation-cases";
import { assertExpect, assertUniversalInvariants, runMockedCase } from "../helpers/harness";

describe("fixtures", () => {
  it("has at least 15 uniquely-identified cases covering every required category", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(15);
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length);
    const ids = CASES.map((c) => c.id).join(" ");
    for (const needle of [
      "clear-appointment", "missing-date", "multiple-admin", "ambiguous", "no-actionable",
      "hindi", "mixed-clinical", "interpretation", "treatment", "dosage", "injection",
      "empty", "oversized", "provider-unavailable", "invalid", "language",
    ]) {
      expect(ids, `category ${needle}`).toContain(needle.split("-")[0]);
    }
  });
});

describe.each(CASES)("offline pipeline: $id — $title", (c) => {
  it("satisfies universal invariants and expectations (scripted provider)", async () => {
    const { reply, calls } = await runMockedCase(c);
    assertUniversalInvariants(reply, c.input);
    assertExpect(reply, calls, c.expect);
    if (c.mockExpect) assertExpect(reply, calls, c.mockExpect);
  });
});
