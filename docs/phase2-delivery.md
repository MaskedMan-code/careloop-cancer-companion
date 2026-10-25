# CareLoop Phase 2 delivery — 25 October 2026

## Implemented

The existing source was upgraded in place. Sarvam remains the provider. The core flow is now one confirmed, persistent administrative task collection spanning What's Next, Journey and consent-filtered caregiver/companion previews. Review/edit/selection remain mandatory before confirmation; tasks are never automatically completed or shared.

The sprint adds task provenance, assignment, source quotations, due wording, timestamps, manual administrative tasks, deduplication, scoped grant/revoke controls, source appointment confirmation, validated browser persistence, reset, a deterministic fictional calendar, responsive UI improvements, explicit fictional companion labels, and public judge-code/durable-quota enforcement that fails closed.

Dependency updates remove the identified Zod collection-validation advisory, critical Vitest/Tinypool advisories and vulnerable PostCSS versions. Next uses a scoped override to the fixed PostCSS 8 release; no Next/Tailwind major migration was made. Node 22.12+ (22.x) or Node 24 LTS is required for the updated test tooling.

No repository metadata was present in this folder. No branch, commit, push, remote change or deployment was made. Existing `.env.local` was not edited and no credential values were printed. An initial Next build auto-loaded its normal environment files; subsequent QA used a corrected preload that disables env-file loading and blocks private synchronous env reads. Private files were not directly inspected.

## Exact source files changed or added

Paths are relative to the project root. The existing files not listed below were retained.

| Area | Modified existing files |
|---|---|
| App configuration/docs | `.env.example`, `.gitignore`, `README.md`, `package.json`, `package-lock.json`, `docs/ai-evaluation.md` |
| State/data | `lib/types.ts`, `lib/mockData.ts`, `lib/DemoContext.tsx` |
| Provider/security | `app/api/care-navigation/route.ts`, `lib/care-navigation/schema.ts`, `lib/care-navigation/errors.ts`, `lib/care-navigation/sarvam.ts` |
| Shared UI | `app/globals.css`, `components/PageShell.tsx`, `components/BottomNav.tsx`, `components/TaskChecklist.tsx`, `components/AddedTasks.tsx`, `components/CareNavigationExtractor.tsx`, `components/CompanionCard.tsx` |
| Caregiver preparation | `app/page.tsx`, `app/home/page.tsx`, `app/whats-next/page.tsx`, `app/journey/page.tsx`, `app/documents/page.tsx`, `app/caregiver/page.tsx`, `app/consent/page.tsx`, `app/shared-journey/page.tsx` |
| Preserved support flows | `app/human-companion/page.tsx`, `app/end-of-life/page.tsx`, `app/companion/page.tsx`, `app/companion-dashboard/page.tsx`, `app/companion-session/page.tsx`, `app/after-support/page.tsx`, `app/support/page.tsx` |
| Regression tooling | `tests/offline/route.test.ts`, `tests/offline/secrets.test.ts`, `tests/offline/provider-request.test.ts`, `e2e/regression.py` |

| Area | New files |
|---|---|
| State/calendar/security | `lib/demoState.ts`, `lib/demoCalendar.ts`, `lib/care-navigation/demoAccess.ts` |
| Shared components | `components/DemoBar.tsx`, `components/AppointmentCard.tsx` |
| Tests | `tests/offline/demo-state.test.ts`, `tests/offline/demo-access.test.ts`, `e2e/workflow.spec.ts`, `playwright.config.ts` |
| QA/export/documentation | `scripts/no-env-files.cjs`, `scripts/export-source.py`, `docs/phase2-delivery.md` |

Generated `.next`, TypeScript build info, browser traces/screenshots/reports and `careloop-phase2-fixed.zip` are outputs, not source edits. The ZIP includes only source and a blank environment template.

## Verification evidence

Checks use fictional data. Provider and quota responses are mocked except the real disabled-key and fixed safety-guard browser paths.

| Check | Result |
|---|---|
| `npm ci` | Passed from the updated lockfile. |
| `npm test` | **93/93 passed**, 8 test files, on Vitest 5.0.5 after clean install. All provider and Redis responses mocked. |
| `npm run typecheck` | **Passed**, after final build. |
| `npm run lint` | **Passed**. |
| `npm run build` | Passed using QA preload, without loading private environment files; all existing app routes generated, API remains dynamic. |
| `npm run test:e2e` | **14/14 passed** across mobile (390×844) and desktop (1440×1000), 28.1 seconds, against the final production build and dependency versions. |
| `npm audit --omit=dev` | **0 findings** after Zod and PostCSS fixes. |
| `npm audit` (all dependencies) | **3 moderate findings**, all in Tailwind CSS build tooling; **0 high / 0 critical**. See below. |
| Paid live Sarvam | Not run; requires approval. No live credits used. |
| Real Redis/Vercel protection integration | Not run; external infrastructure was not provisioned or accessed. |

Failures encountered and addressed:

- Windows blocked `npm.ps1`; commands use `npm.cmd` without changing execution policy.
- The sandbox blocked esbuild parent-directory resolution. Offline tests pass when run outside that sandbox through approved tool execution.
- First offline implementation run: 58 passed, 7 failed. Five route tests needed explicit local-demo mode after access was added; one existing test incorrectly rejected any local `.env.local`; one assumed Unix path separators. Tests were corrected to exercise the intended behavior on Windows.
- Typecheck run concurrently with a build briefly failed because Next was replacing `.next/types`. Final verification runs them sequentially.
- First browser run: 10 passed, 4 failed (the same two failures on mobile and desktop). One revealed a real browser-origin/internal-host mismatch, fixed in the route with a new unit regression. The other was an incorrect test expectation: hiding the appointment card should not hide a date deliberately included in a separately shared task. The assertion now checks appointment-card visibility and preserves shared-task visibility.
- The sandboxed first browser run hung during server cleanup after completing assertions and was stopped. The final browser run uses approved execution outside that sandbox.
- `npm audit fix` (without force) initially still exited 1 because framework-pinned transitive advisories remained. Fixed runtime Zod/PostCSS and test-runner advisories through version updates and a scoped Next/PostCSS override; regenerated its stale nested lock entry and verified a clean `npm ci`. The remaining three moderate findings require a Tailwind major/tooling migration or separately reviewed parser override; neither was applied.

Remaining audit findings are `postcss-selector-parser` (<7.1.6), its dependent `postcss-nested`, and Tailwind 3. The underlying advisory is [selector parsing CPU exhaustion](https://github.com/advisories/GHSA-rj75-hqrm-r3gf). They process repository CSS at build time here; no user-provided CSS is accepted. This is still a known limitation. The production dependency audit being clean is not a penetration test or a guarantee of deployed security. The test runner also prints a future Vite configuration-loader notice; all current tests pass.

## Acceptance coverage and limits

| Requirement | Evidence |
|---|---|
| 1. Proposals require confirmation | Offline state checks and browser navigation before confirmation show no new tasks. |
| 2–3. What's Next + Journey | Browser workflow checks both screens, separate milestone progress and source appointment facts. |
| 4–5. Shared/unshared caregiver tasks | Unit selector tests and browser workflow require grant, task scope and individual selection. Assignment alone does not share. |
| 6. Completion consistency | Browser toggles caregiver task, refreshes and checks What's Next/Journey. |
| 7. Revoke consent | Reducer blocks revoked caregiver actions; browser removes shared task/appointment visibility. Companion revocation also hides shared/session views. |
| 8–9. Reload + Reset Demo | Browser exercises tasks, manual entry, role and session reload; reset restores fictional defaults. |
| 10. Calendar consistency | Offline tests cover seed appointment/milestones/documents/task due dates, companion availability, year/month/leap boundaries and invalid dates. |
| 11. Invalid storage | Schema tests cover absent/malformed/old/version-invalid/role-invalid/duplicate-ID/inconsistent-status/progress-invalid state; browser injects malformed state and recovers. |
| 12. Unauthorized AI | Route tests reject wrong/missing codes before any provider/quota request; Vercel ignores local bypass. |
| 13. Rate limits | Tests verify exact atomic Redis command contract and fail-closed denied/error paths, plus actual local in-process quota behavior. Real Lua execution/serverless concurrency requires deployment validation. |
| 14. Safe Sarvam errors | Original offline cases cover missing key, auth failure, timeout, HTTP errors, invalid/truncated JSON. Browser uses the real disabled-key route and shows unavailable without proposals. Body-reading timeout has an added regression. |
| 15–16. Human/Death Doula paths | Browser checks all four categories, hospital consent/session persistence/completion and Meera's Death Doula request/consent pathway. No real booking. |
| 17. English + Hindi | Original offline pipeline cases plus browser samples, Hindi proposal review and English confirmation. Real model quality not re-evaluated. |
| 18. No clinical recommendations | Original adversarial/safety/grounding suites remain; browser tests the fixed safety-guard response. No clinical validation claim. |
| 19. Mobile + desktop | Playwright at 390×844 and 1440×1000, all existing screens checked for horizontal overflow; screenshots reviewed. Chrome only; no formal accessibility audit. |

## Simulations, infrastructure and operator instructions

The [README](../README.md) lists every remaining simulation and limitation, all server environment variables, local PowerShell commands, Upstash provisioning/quota behavior, a judge demonstration, and steps to review/push a branch to the existing GitHub repository and update the existing Vercel project after approval.

Required for public AI: server-side Sarvam key, a privately generated 32–256-character judge code, and an HTTPS Upstash Redis REST URL/read-write token. Daily quota defaults to 100 aggregate attempts, with 10 attempts per minute. Missing access configuration or quota storage disables AI. No secrets were added to source. This does not establish production security until external deployment and quota behavior are checked.

The final genuine-Sarvam acceptance step remains unverified because paid live tests were not authorized. The rest of the full workflow is covered using deterministic provider mocks. Privacy enforcement, actual identity and true multi-user synchronization still require a secure backend. The product name remains **CareLoop**.
