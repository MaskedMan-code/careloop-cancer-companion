import { describe, expect, it } from "vitest";
import { DemoStateSchema, initialDemoState, mergeConfirmedTasks, reduceDemo, restoreDemoState, sharedCaregiverTasks } from "@/lib/demoState";
import { DEMO_APPOINTMENT_DATE, DEMO_APPOINTMENT_LABEL, DEMO_CREATED_AT, DEMO_TODAY, dateDay, formatDemoDate, relativeDemoDate, SAMPLE_EN, SAMPLE_HI } from "@/lib/demoCalendar";
import { companions, documents, journeySteps, nextAppointment } from "@/lib/mockData";
import { CASES } from "../fixtures/care-navigation-cases";
import { runMockedCase } from "../helpers/harness";
import type { ConfirmedTaskInput } from "@/lib/types";

const item: ConfirmedTaskInput = { label: "Bring appointment slip", category: "documents", dueText: "12 December 2026", sourceQuote: "Please bring appointment slip", explicit: true, assignedTo: "caregiver" };
const now = DEMO_CREATED_AT;
const add = () => { const state = initialDemoState(); return { ...state, tasks: mergeConfirmedTasks(state.tasks, [item], now, () => "ai-test").tasks }; };

describe("one confirmed task collection", () => {
  it("extracting English/Hindi proposals alone does not change demo state", async () => {
    const state = initialDemoState();
    const original = JSON.stringify(state);
    for (const id of ["clear-appointment-en", "hindi-appointment"]) {
      const fixture = CASES.find((c) => c.id === id) ?? CASES.find((c) => c.input.includes("अपॉइंटमेंट"))!;
      const { reply } = await runMockedCase(fixture);
      expect(reply.body.ok).toBe(true);
      expect(JSON.stringify(state)).toBe(original);
    }
  });
  it("explicit confirmation preserves source, assignment and actual dates, always pending/private", () => {
    const state = add();
    const task = state.tasks.at(-1)!;
    expect(task).toMatchObject({ label: item.label, status: "pending", done: false, source: "ai", confirmationStatus: "confirmed", sharedWithCaregiver: false, assignedTo: "caregiver", dueText: item.dueText, sourceQuote: item.sourceQuote, createdAt: now });
    expect(DemoStateSchema.safeParse(state).success).toBe(true);
  });
  it("deduplicates repeated confirmation/reload; allows the same task for a different date", () => {
    const state = restoreDemoState(JSON.stringify(add()));
    const result = mergeConfirmedTasks(state.tasks, [{ ...item, label: "  BRING   appointment slip  " }, item], now, () => "unused");
    expect(result.added).toBe(0); expect(result.skipped).toBe(2);
    expect(mergeConfirmedTasks(result.tasks, [{ ...item, dueText: "13 December 2026" }], now, () => "new-date").added).toBe(1);
  });
  it("requires both grant, task scope and individual selection, independent of assignment", () => {
    const state = add();
    expect(sharedCaregiverTasks(state)).toEqual([]);
    state.caregiverSharing.granted = true;
    expect(sharedCaregiverTasks(state)).toEqual([]);
    state.tasks.at(-1)!.sharedWithCaregiver = true;
    expect(sharedCaregiverTasks(state).map((t) => t.id)).toEqual(["ai-test"]);
    state.caregiverSharing.navigationTasks = false;
    expect(sharedCaregiverTasks(state)).toEqual([]);
  });
  it("shares the same task completion; rejects caregiver changes to unshared or revoked tasks", () => {
    let state = add();
    expect(reduceDemo(state, { type: "toggleTask", id: "ai-test", caregiver: true, now })).toBe(state);
    state.caregiverSharing.granted = true; state.tasks.at(-1)!.sharedWithCaregiver = true;
    state = reduceDemo(state, { type: "toggleTask", id: "ai-test", caregiver: true, now });
    expect(state.tasks.at(-1)!.done).toBe(true);
    expect(sharedCaregiverTasks(state).at(-1)!.status).toBe("completed");
    state = reduceDemo(state, { type: "revokeCaregiver" });
    expect(sharedCaregiverTasks(state)).toEqual([]);
    expect(reduceDemo(state, { type: "toggleTask", id: "ai-test", caregiver: true, now })).toBe(state);
  });
  it("round-trips role, consent, progress, tasks and raw appointment facts", () => {
    const state = add(); state.role = "caregiver"; state.consentGiven = true; state.selectedCompanionId = "meera-rao"; state.companionSessionStep = 3;
    state.confirmedAppointment = { title: null, time: null, location: null, department: null, date: { value: "12 December 2026", source_quote: "on 12 December 2026" } };
    expect(restoreDemoState(JSON.stringify(state))).toEqual(state);
    expect(initialDemoState()).not.toEqual(state);
    expect(initialDemoState().consentGiven).toBe(false);
  });
  it.each([null, "", "{broken", "[]", '{"version":1}', JSON.stringify({ ...initialDemoState(), role: "admin" }), JSON.stringify({ ...initialDemoState(), companionSessionStep: 50 }), JSON.stringify({ ...initialDemoState(), tasks: [{ ...initialDemoState().tasks[0], done: true }] }), JSON.stringify({ ...initialDemoState(), tasks: [initialDemoState().tasks[0], initialDemoState().tasks[0]] })])("safely resets missing/invalid stored state %s", (raw) => {
    expect(restoreDemoState(raw)).toEqual(initialDemoState());
  });
  it("persists companion progression and prevents changes after consent revocation", () => {
    const state = initialDemoState(); state.consentGiven = true; state.selectedCompanionId = "meera-rao";
    const progressed = reduceDemo(state, { type: "advanceSession" });
    expect(restoreDemoState(JSON.stringify(progressed)).companionSessionStep).toBe(1);
    const revoked = reduceDemo(progressed, { type: "revokeCompanion" });
    expect(reduceDemo(revoked, { type: "advanceSession" }).companionSessionStep).toBe(1);
  });
});

describe("deterministic fictional calendar", () => {
  it("has exactly one next-day appointment everywhere", () => {
    expect(dateDay(DEMO_APPOINTMENT_DATE) - dateDay(DEMO_TODAY)).toBe(1);
    expect(nextAppointment.date).toBe(DEMO_APPOINTMENT_LABEL);
    expect(journeySteps.find((s) => s.status === "current")!.date).toBe(nextAppointment.date);
    expect(documents[0].date).toBe(nextAppointment.date);
    expect(initialDemoState().tasks.every((t) => t.dueText === nextAppointment.date)).toBe(true);
    expect(SAMPLE_EN).toContain(nextAppointment.date);
    expect(SAMPLE_HI).toContain("26 अक्टूबर 2026");
    expect(companions[0].availability).toContain(nextAppointment.date);
  });
  it("handles month/year/leap boundaries and absolute labels without timezone dependence", () => {
    expect(relativeDemoDate("2027-01-01", "2026-12-31")).toBe("Tomorrow");
    expect(relativeDemoDate("2028-02-29", "2028-02-28")).toBe("Tomorrow");
    expect(relativeDemoDate(DEMO_TODAY)).toBe("Today");
    expect(relativeDemoDate("2026-10-24")).toBe("Yesterday");
    expect(relativeDemoDate("2026-10-28")).toBe("In 3 days");
    expect(relativeDemoDate("2026-10-22")).toBe("3 days ago");
    expect(formatDemoDate("2026-10-26")).toBe("26 October 2026");
    expect(() => dateDay("2026-02-30")).toThrow();
    expect(() => dateDay("26/10/2026")).toThrow();
  });
});
