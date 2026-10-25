import { test, expect, type Page } from "@playwright/test";

const response = {
  ok: true, source: "sarvam-live", model: "sarvam-105b", warnings: [],
  result: {
    summary: "Appointment details and documents to prepare.", language_detected: "english",
    appointment: { title: null, date: { value: "12 December 2026", source_quote: "Appointment on 12 December 2026" }, time: null, location: null, department: null },
    tasks: [
      { id: "t1", label: "Bring appointment slip", category: "documents", origin: "explicit", due_text: "12 December 2026", source_quote: "Please bring appointment slip" },
      { id: "t2", label: "Call reception", category: "communication", origin: "explicit", due_text: null, source_quote: "Call reception" },
      { id: "t3", label: "Arrange transport", category: "transport", origin: "suggestion", due_text: null, source_quote: null },
    ], missing_or_ambiguous: [{ topic: "Time", note: "Not stated" }],
    clinical: { content_detected: false, advice_requested: false, urgent_concern_detected: false }, safe_message: "Review before confirming. No clinical advice.",
  },
};

async function ready(page: Page, path: string) {
  await page.goto(path); await expect(page.getByRole("button", { name: "Reset Demo", exact: true })).toBeEnabled();
}
async function mockExtract(page: Page) {
  await page.route("**/api/care-navigation", (route) => route.fulfill({ json: response }));
  await ready(page, "/documents");
  await page.locator("#care-text").fill("Fictional appointment on 12 December 2026. Please bring appointment slip. Call reception.");
  await page.getByRole("button", { name: "Find my tasks", exact: true }).click();
  await expect(page.getByText("Proposed tasks", { exact: true })).toBeVisible();
}

test("review → confirm → journey → caregiver → completion → reload → revoke → reset", async ({ page }, testInfo) => {
  const pageErrors: string[] = []; page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockExtract(page);
  await expect(page.getByText("Read by Sarvam AI (live)", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).tasks.length)).toBe(4);
  await page.getByRole("link", { name: "Journey", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bring appointment slip", exact: true })).toHaveCount(0);
  await mockExtract(page);
  await page.getByRole("checkbox", { name: "Include task: Call reception", exact: true }).uncheck();
  await page.getByRole("button", { name: "Remove task: Arrange transport", exact: true }).click();
  await page.getByRole("textbox", { name: "Task wording", exact: true }).first().fill("Pack appointment slip");
  await page.getByRole("combobox", { name: "Assign proposal: Pack appointment slip", exact: true }).selectOption("caregiver");
  await page.getByRole("checkbox", { name: "Use these source appointment details", exact: false }).check();
  await page.screenshot({ path: testInfo.outputPath("review.png"), fullPage: true });
  await page.getByRole("button", { name: "Add 1 selected task to my journey", exact: true }).click();
  await expect(page.getByText("1 task added to your journey", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "See in What’s next", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("12 December 2026", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Time unknown", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Call reception", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Journey", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toBeVisible();
  await expect(page.getByText("3 of 6 steps completed", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Open What’s next", exact: false }).click();
  await page.getByRole("checkbox", { name: "Share task: Pack appointment slip", exact: true }).check();
  await page.getByRole("link", { name: "Share with caregiver", exact: true }).click();
  await page.getByRole("button", { name: "Give consent & continue", exact: true }).click();
  await page.getByRole("link", { name: "View caregiver checklist", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm appointment", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Pack appointment slip", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: testInfo.outputPath("caregiver.png"), fullPage: true });
  await ready(page, "/whats-next");
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toHaveAttribute("aria-pressed", "true");
  await ready(page, "/journey");
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toHaveAttribute("aria-pressed", "true");
  await ready(page, "/consent?target=caregiver");
  await page.getByRole("checkbox", { name: "Appointment details", exact: true }).uncheck();
  await page.getByRole("link", { name: "View caregiver checklist", exact: true }).click();
  await expect(page.getByText("Appointment details are not shared.", { exact: true })).toBeVisible();
  await expect(page.getByText("Source appointment · reviewed and confirmed", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toBeVisible();
  await ready(page, "/consent?target=caregiver");
  await page.getByRole("button", { name: "Revoke sharing", exact: true }).click();
  await ready(page, "/caregiver");
  await expect(page.getByRole("button", { name: "Pack appointment slip", exact: true })).toHaveCount(0);
  await expect(page.getByText("Sharing is off. No appointment or tasks are shared.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset Demo", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/); await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).tasks.length)).toBe(4);
  await expect(page.getByText("Seeded example appointment", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("repeated confirmation does not duplicate tasks after reload", async ({ page }) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    await mockExtract(page);
    await page.getByRole("checkbox", { name: "Include task: Call reception", exact: true }).uncheck();
    await page.getByRole("button", { name: "Add 1 selected task to my journey", exact: true }).click();
    await page.reload();
  }
  await ready(page, "/whats-next");
  await expect(page.getByRole("button", { name: "Bring appointment slip", exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).tasks.length)).toBe(5);
});

test("invalid storage recovers; manual tasks and role persist; reset clears consent/progress", async ({ page }) => {
  await ready(page, "/home");
  await page.evaluate(() => localStorage.setItem("careloop.demo.v2", '{"version":2,"tasks":"broken"}'));
  await page.reload(); await expect(page.getByText("4 tasks to prepare for your visit", { exact: true })).toBeVisible();
  await ready(page, "/whats-next"); await page.getByLabel("Add your own administrative task", { exact: true }).fill("Pack fictional ID");
  await page.getByRole("button", { name: "Add task", exact: true }).click(); await page.reload();
  await expect(page.getByRole("button", { name: "Pack fictional ID", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Demo view", exact: true }).selectOption("caregiver");
  await page.reload(); await expect(page.getByRole("combobox", { name: "Demo view", exact: true })).toHaveValue("caregiver");
  await page.getByRole("button", { name: "Reset Demo", exact: true }).click(); await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).role)).toBeNull();
});

test("all four human pathways remain visible; hospital and Death Doula consent/session work", async ({ page }) => {
  await ready(page, "/human-companion");
  for (const label of ["Hospital Companion", "Cancer Care Navigator", "Family / Practical Support", "End-of-Life Companion / Death Doula"]) await expect(page.getByText(label, { exact: true })).toBeVisible();
  await page.getByText("Hospital Companion", { exact: true }).click();
  await expect(page.getByText("Fictional demo profile", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Request companion", exact: true }).click();
  await page.getByRole("button", { name: "Give consent & continue", exact: true }).click();
  await page.getByRole("link", { name: "View shared journey", exact: true }).click();
  await expect(page.getByText("Patient consent recorded", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Open companion session", exact: true }).click();
  await page.getByRole("button", { name: "Mark next step complete", exact: true }).click();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).companionSessionStep)).toBe(1);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Mark next step complete", exact: true }).click();
  await page.getByRole("link", { name: "Complete session", exact: true }).click();
  await expect(page.getByText("Journey updated", { exact: true })).toBeVisible();
  await ready(page, "/consent"); await page.getByRole("button", { name: "Revoke sharing", exact: true }).click();
  await ready(page, "/shared-journey"); await expect(page.getByText("Sharing is off", { exact: true })).toBeVisible();
  await ready(page, "/human-companion"); await page.getByText("End-of-Life Companion / Death Doula", { exact: true }).click();
  await page.getByRole("link", { name: "Explore support", exact: true }).click();
  await expect(page.getByText("Meera Rao", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Request companion", exact: true }).click();
  await page.getByRole("button", { name: "Give consent & continue", exact: true }).click();
  await page.getByRole("link", { name: "View shared journey", exact: true }).click();
  await expect(page.getByText("Meera Rao", { exact: false })).toBeVisible();
});

test("Hindi sample/review remains usable and proposals stay unconfirmed", async ({ page }) => {
  await ready(page, "/documents");
  await page.getByRole("button", { name: "Sample (Hindi)", exact: true }).click();
  await expect(page.locator("#care-text")).toHaveValue(/26 अक्टूबर 2026/);
  await page.route("**/api/care-navigation", (route) => route.fulfill({ json: { ...response, result: { ...response.result, language_detected: "hindi", tasks: [{ ...response.result.tasks[0], label: "अपॉइंटमेंट स्लिप साथ लाएं", source_quote: "अपना अपॉइंटमेंट स्लिप साथ लाएं" }] } } }));
  await page.getByRole("button", { name: "Find my tasks", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Task wording", exact: true })).toHaveValue("अपॉइंटमेंट स्लिप साथ लाएं");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("careloop.demo.v2")!).tasks.length)).toBe(4);
});

test("real no-key errors and safety guard are clear; no canned extraction", async ({ page }) => {
  await ready(page, "/documents"); await page.getByRole("button", { name: "Sample (English)", exact: true }).click();
  await page.getByRole("button", { name: "Find my tasks", exact: true }).click();
  await expect(page.getByText("AI unavailable", { exact: true })).toBeVisible();
  await expect(page.getByText("The AI service isn't set up on this server", { exact: false })).toBeVisible();
  await expect(page.getByText("Proposed tasks", { exact: true })).toHaveCount(0);
  await page.locator("#care-text").fill("I have severe chest pain and can't breathe.");
  await page.getByRole("button", { name: "Find my tasks", exact: true }).click();
  await expect(page.getByText("Safety check only", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Add .*selected/ })).toHaveCount(0);
  await page.locator("#care-text").fill("x".repeat(4001)); await expect(page.getByRole("button", { name: "Find my tasks", exact: true })).toBeDisabled();
});

test("all existing screens render without horizontal overflow", async ({ page }, testInfo) => {
  for (const path of ["/", "/home", "/journey", "/whats-next", "/documents", "/caregiver", "/companion", "/human-companion", "/human-companion/matching?type=navigator", "/human-companion/matching?type=family", "/end-of-life", "/end-of-life/profile", "/consent", "/shared-journey", "/companion-session", "/after-support", "/support", "/companion-dashboard", "/end"]) {
    const res = await page.goto(path); expect(res?.status(), path).toBe(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
  }
  await ready(page, "/home"); await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
});
