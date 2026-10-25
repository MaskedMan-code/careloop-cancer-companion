# CareLoop

**Continuous care, beyond the hospital.** Health-a-thon 2026, Phase 2.

CareLoop helps a cancer patient's caregiver prepare for the next appointment: fictional instructions → Sarvam administrative extraction → review and edit → explicit confirmation → one preparation plan → scoped caregiver sharing.

**Fictional information only. No diagnosis, medical interpretation, treatment advice, medication advice, clinical urgency assessment or risk scoring.**

## MVP status

Implemented in the existing Next.js 15 / React 18 / TypeScript application:

- The existing Sarvam provider, structured output, English/Hindi grounding and deterministic safety checks are preserved. Nothing silently substitutes mock AI results.
- Proposals remain separate from confirmed tasks. Review includes wording, due wording/date, assignment, removal and opt-in suggestions. Confirmation is explicit.
- A single task collection powers What's Next, Journey and permitted caregiver/companion previews. Tasks retain IDs, provenance, confirmation, status, original quotation, category, assignee, optional due wording, sharing selection and creation/update timestamps.
- Completion updates the same task everywhere. Confirming the same normalized title + due wording again is deduplicated, including after reload. A task for a different date can be added separately.
- Caregiver consent has grant/revoke, appointment/task scope and individual task selection. New tasks are private by default; assignment alone never shares them. Companion consent is a separate grant, using the same individual support-team task selection.
- Confirmed tasks, completion, role, consent, source appointment facts and companion progress survive reload using schema-validated, versioned `careloop.demo.v2` localStorage. Invalid/old data resets safely. **Reset Demo** restores fictional defaults and affects only CareLoop's storage key.
- Fixed fictional today: **25 October 2026**; seeded next appointment: **26 October 2026, 10:30 AM**. The calendar never depends on the device clock or timezone. Examples, milestones, seed due dates and fictional availability use it.
- Source appointment facts require their own checkbox during confirmation. They retain the actual extracted date/text; unknown fields remain unknown. Seeded milestones and seed tasks remain explicitly fictional examples, even when a source appointment differs. Unstructured source dates are not automatically converted to ISO dates or given potentially misleading relative labels.
- A wider responsive layout, clear task states, prominent preparation actions, source quotations, success/error states, accessible controls, reduced-motion support, browser-storage feedback, and print/save-to-PDF action.
- Hospital Companion, Cancer Care Navigator, Family / Practical Support and **End-of-Life Companion / Death Doula** remain available. Fictional profiles and availability no longer claim real verification. Companion sessions retain their consent flow and persist progress.
- Public AI requests require a private judge code and an atomic Redis quota. Missing/misconfigured protection or unavailable Redis fails closed.

See [implementation files and validation notes](docs/phase2-delivery.md) for the exact change list and test results.

## What remains simulated or limited

- This is a **single-browser fictional prototype**. Local consent filters are a UI demonstration, not secure patient-data access control. There is no identity verification, secure backend, account system, cross-device sync, multi-user synchronization, notifications or messaging.
- Confirmed task wording, source quotations, appointment facts and preferences are stored unencrypted in that browser. Raw pasted input, unconfirmed proposals and the judge code are not persisted. Never enter real patient information. Reset Demo removes modified demo progress.
- AI Companion chat is explicitly **scripted demo chat**. It reports current local task counts but makes no model calls. The genuine AI feature is Documents → Find my tasks.
- Simulated document buttons add prewritten screen-local previews only. They do not extract tasks, change milestones or persist on reload.
- Human profiles, requests, availability, consent, sessions and after-support activity are fictional. There are no real bookings, service-provider checks, hospital integrations or payments.
- Clinical guards are conservative English/Hindi text rules, not clinical safety validation. They may over-filter or miss paraphrases and have not had clinician review. CareLoop never infers missing appointments or medical instructions.
- Text submitted for extraction goes to Sarvam, a third party. No patient-data governance, retention contract, compliance assessment or production security audit is provided.
- Live Sarvam calls and a real Upstash deployment were **not exercised in this sprint**. Offline tests mock provider/quota responses; browser happy paths intercept the API. Real extraction quality, credits, deployed quota execution and Vercel configuration require an approved live check. Do not describe the public deployment as security-verified.
- One shared judge code is a simple paid-demo gate, not per-user authentication. All judges share the budget. Anyone with the code can consume that budget; rotate it if disclosed. There is no per-person audit trail.
- Browser tests use installed Chrome at 390×844 and 1440×1000. Other browsers, real devices, screen readers and formal accessibility audits are not verified.

## Run locally

Use Node.js 22.12+ on the 22.x LTS line, or Node 24 LTS, and npm. Node 24 was used for this sprint; the updated test runner requires these supported Node versions. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```powershell
npm.cmd ci
# Keep your existing .env.local. Edit it yourself only if configuration is needed.
# For an explicitly local loopback demo, enable this for the current shell:
$env:CARELOOP_LOCAL_DEMO = "1"
npm.cmd run dev
```

Open `http://localhost:3000`. Server-side `SARVAM_API_KEY` must already be configured for genuine extraction. A fresh setup may copy the placeholder `.env.example` only if `.env.local` does not exist. Never overwrite an existing credential file.

For production-mode local preview: `npm.cmd run build`, then `npm.cmd start`. Normal Next.js development/build/start loads your configured environment files. QA can avoid opening private environment files by setting `$env:NODE_OPTIONS = '--require ./scripts/no-env-files.cjs'` and `$env:SARVAM_API_KEY = ''` for the QA subprocess. **Remove that QA-only NODE_OPTIONS setting before normal development or deployment.**

## Environment variables

All variables below are **server-only**. Never use a `NEXT_PUBLIC_` prefix for them or put secrets in source, logs or client JavaScript. `.env.example` has blank secret placeholders.

| Variable | Purpose |
|---|---|
| `SARVAM_API_KEY` | Sarvam subscription key; required for real extraction. |
| `SARVAM_MODEL` | Optional; default `sarvam-105b`; also allows `sarvam-105b-conversations`. |
| `CARELOOP_LOCAL_DEMO` | Set to `1` only for explicit loopback development. Ignored when `VERCEL` is set and on non-loopback request URLs. Never enable on a public self-hosted server. |
| `CARELOOP_DEMO_ACCESS_CODE` | Required for public/preview AI access: generate a random 32–256-character code, store server-side, and privately give it to judges. No public default exists. |
| `UPSTASH_REDIS_REST_URL` | Public mode requires an HTTPS Upstash Redis REST URL such as the placeholder `https://your-database.upstash.io`. |
| `UPSTASH_REDIS_REST_TOKEN` | Public mode requires its read/write Redis REST token; never give this to judges. |
| `CARELOOP_AI_DAILY_LIMIT` | Optional; default 100 aggregate accepted attempts per UTC day; integer 1–1000. |

The judge types their code into the masked Documents field. It travels in `X-CareLoop-Access-Code` and stays only in screen memory. Code comparison uses SHA-256 digests and constant-time comparison. Public requests with a missing/incorrect code return 401; missing/weak access configuration or failed quota protection returns 503. The UI shows AI unavailable, without fabricated extraction.

## Public AI protection and required infrastructure

Provision a dedicated **Upstash Redis database** and set its REST URL/read-write token on the existing Vercel project. The implementation uses the [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi) and [atomic Lua EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval); no Redis npm dependency is required.

One EVAL checks/increments **both** shared counters atomically before any Sarvam call:

- 10 accepted attempts in a 60-second window starting at its first hit.
- The configured aggregate daily budget, keyed by UTC calendar day.

All serverless instances and judges share `careloop:{ai}:minute` and `careloop:{ai}:day:YYYY-MM-DD`. These keys contain no source text, code or IP address. Rotating the judge code does not reset quotas. Use one dedicated database for the intended shared budget; environments pointing to the same database intentionally share it. Do not manually clear keys to bypass budget enforcement.

Requests consume quota even if Sarvam later fails or a deterministic safety check handles the text. Failed authorization/validation does not consume paid-request quota. Minute-key TTL is 60 seconds; daily keys expire after 48 hours. Redis errors, invalid responses and a 3-second timeout fail closed. Local bypass uses only an in-process courtesy limiter and is not a public security control.

The route rejects unexpected request structure, empty or >4,000-character input, non-JSON and cross-origin browser submissions. Streaming body reads are capped at 25,000 bytes and 5 seconds. Sarvam output is capped at 2,500 tokens; its 45-second timeout includes response-body parsing. Route `maxDuration` is 60 seconds. Use a Vercel plan/function configuration that supports that duration. No permissive CORS is provided; authentication is still mandatory for non-browser requests.

## Test and build

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Run typecheck **after** the build finishes, not concurrently: Next rewrites `.next/types`. Vitest does not load `.env.local`; offline provider tests use fictional inputs and mocked responses. No Sarvam credits are used by these tests.

Playwright is now a project dev dependency. The default browser is installed Google Chrome. Alternatively install Chromium with `npx playwright install chromium` and set `$env:PLAYWRIGHT_CHANNEL = 'chromium'`. E2E starts its own production server on loopback port 3411, forces the Sarvam key empty, and disables private env-file loading. Do not run a different server on that port. `python e2e/regression.py` is a compatibility wrapper for this maintained suite.

Browser evidence is in `test-results/`; the HTML report is in `playwright-report/`. Both are excluded from the source ZIP and Git.

The paid live suite remains separate: `test:live` requires `RUN_LIVE_TESTS=1` and an operator-supplied server key. **Obtain approval before any paid live test.** Do not use it for routine regression. Historical evaluation notes are in [AI evaluation](docs/ai-evaluation.md); this sprint's current evidence is in [delivery notes](docs/phase2-delivery.md).

## Judge demonstration

1. Open Home → Read my appointment text → use a fictional English/Hindi sample.
2. On a public deployment, enter the private judge code. Select Find my tasks for a genuine Sarvam request.
3. Review stated facts, optional suggestions and missing information. Edit task wording/due wording/assignee, untick or remove unwanted proposals.
4. Optionally check Use these source appointment details. Confirm selected tasks. Nothing becomes complete automatically.
5. Open What's Next and Journey. Review original quotations and responsibilities; seeded milestones remain separate.
6. Choose individual tasks for caregiver sharing → Share with caregiver → choose scope → Give consent & continue.
7. View caregiver checklist, complete a task, revisit What's Next/Journey, and refresh. The same task status persists.
8. Revoke sharing to hide shared tasks/details. Reset Demo restores the fictional starting point.
9. Need someone to help → Hospital Companion, or **End-of-Life Companion / Death Doula** → Explore support → Request companion → demo consent → shared journey/session.

## Push to the existing GitHub repository (operator action)

This supplied folder has **no `.git` repository**, so no working branch could be created here. Nothing was committed or pushed.

1. Clone your existing GitHub repository into a separate review folder. Do not replace or delete this local source of truth.
2. In that clone run `git switch -c careloop/phase2-fixed`.
3. Extract `careloop-phase2-fixed.zip` into that clone. The ZIP contains source only, no `.git` or private env files. Review all differences against the older repository.
4. Run the checks above. Verify `git check-ignore .env.local` and inspect `git status --short`; never add secrets or generated files.
5. Stage only the source files listed in [delivery notes](docs/phase2-delivery.md), review `git diff --cached`, and commit with `git commit -m "Connect caregiver preparation workflow and protect demo AI"`.
6. After your approval, run `git push -u origin careloop/phase2-fixed` and open a PR against the existing default branch. Do not force-push unrelated history.

## Update the existing Vercel project (operator action)

1. Open the **existing** Vercel project. Keep its linked repository and root directory; do not create another application/project.
2. Set the server variables above for the intended Preview/Production environments. Provision Redis and privately distribute a newly generated judge code. Do not set `CARELOOP_LOCAL_DEMO=1` for public use. Do not paste any secret into this chat.
3. Deploy the approved branch to Preview through the existing project. Verify missing/wrong-code rejection, quota failure behavior and the UI before granting paid test approval.
4. With explicit approval for a small number of paid calls, test genuine English and Hindi extraction on fictional text, then the full confirmation/sharing/reload/companion flow. Verify Redis counters and limit enforcement in that environment. Mocked tests do not establish deployed security.
5. Only after approval, merge/promote using the existing project's deployment workflow. Environment changes require a new deployment. Keep the previous deployment available for rollback.

No push or deployment was performed. Local `.env.local` was not modified and no credential values were printed.

## Source export

Run `python scripts/export-source.py` to create **careloop-phase2-fixed.zip**. The exporter uses a source allow-list and excludes `node_modules`, `.next`, Git metadata, private environment files, generated reports, credential file extensions and nested ZIPs. Only the blank `.env.example` template is included.

## Dependency security status

The sprint updated Zod to 4.6.7, Vitest to 5.0.5, PostCSS to 8.5.31 and Node type declarations to the 24.x line. A scoped npm override makes Next use the fixed PostCSS 8 release; the Next.js 15 and Tailwind 3 major versions are preserved. The lockfile records these versions.

The final advisory check and remaining findings are recorded in [delivery notes](docs/phase2-delivery.md). npm audit data changes over time. Remaining Tailwind selector-parser findings concern build-time CSS tooling; this application does not accept user CSS. They are still tracked limitations, not a production-security assurance. No `npm audit fix --force` or framework-major migration was performed.
