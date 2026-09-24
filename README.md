# CareLoop

**"Continuous care, beyond the hospital."**

A clickable prototype built for **Health-a-thon 2026** (Koita Foundation, KCDH-IIT Bombay, National Cancer Grid). CareLoop is a dual-mode **AI + Human Cancer Care Companion** for patients and caregivers — one continuous journey, with the right kind of support at the right time.

This is a **non-clinical, assistive workflow prototype**. It does not diagnose, recommend treatment, or interpret medical results. Clinical decisions remain with the healthcare team throughout.

---

## What this demonstrates

1. A cancer patient (Ayesha Khan, fictional demo persona) has **one continuous journey**.
2. The **AI Care Companion** keeps that journey organized — appointments, documents, reminders, "what's next?".
3. The **caregiver** (Sara Khan) can participate, with the patient's consent.
4. A **Human Companion** (Hospital Companion, Cancer Care Navigator, Family/Practical Support) can join when physical presence is needed.
5. A dedicated **End-of-Life Companion / Death Doula** pathway exists as an explicit, first-class feature — not hidden inside generic support.
6. When a human joins, they join the **same** CareLoop journey — nothing is repeated or lost, and only information the patient consents to share is visible.
7. Clinical decisions remain with doctors, nurses, and palliative/hospice professionals at every step.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling (custom `care-*` color tokens matching the CareLoop brand palette)
- **lucide-react** for icons
- All data is **local, fictional mock data** — no real APIs, no real patient records, no payments, no background-check integrations

The architecture keeps data (`/lib/mockData.ts`, `/lib/types.ts`) separate from UI components, so it can later be connected to a real backend (e.g. Supabase/PostgreSQL) without restructuring the app.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To build and run a production instance:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.tsx                      Screen 1 — Welcome / role selection
  home/page.tsx                 Screen 2 — Patient home
  journey/page.tsx              Screen 3 — Care journey timeline
  whats-next/page.tsx           Screen 4 — "What's next?" (hero interaction)
  documents/page.tsx            Screen 5 — Document / instruction organization
  companion/page.tsx            Screen 6 — AI Care Companion chat
  caregiver/page.tsx            Screen 7 — Caregiver mode (Sara Khan)
  human-companion/page.tsx      Screen 8 — Choose human support
  human-companion/matching/     Screen 9 — Companion matching list
  end-of-life/page.tsx          Screen 10 — End-of-life pathway
  end-of-life/profile/          Screen 11 — Death doula profile (Meera Rao)
  consent/page.tsx              Screen 12 — Consent handoff
  shared-journey/page.tsx       Screen 13 — Shared journey view
  companion-session/page.tsx    Screen 14 — Mock companion session
  after-support/page.tsx        Screen 15 — Continuity / journey updated
  support/page.tsx              Screen 16 — Support & safety boundary
  companion-dashboard/page.tsx  Screen 17 — Human companion dashboard
  end/page.tsx                  Screen 18 — Demo summary screen

components/    Reusable UI (PageShell, Header, BottomNav, JourneyTimeline,
               TaskChecklist, CompanionCard, Disclaimer, Buttons, Card, StatusBadge)
lib/           mockData.ts, types.ts, DemoContext.tsx (shared demo state:
               role, tasks, consent, selected companion, session progress)
```

## Demo flow (suggested walkthrough)

1. **Welcome** → Continue as Patient
2. **Home** → "What's next?"
3. Check off a task, then **Need someone to help**
4. Pick **Hospital Companion** → view Priya Sharma's profile → **Request companion**
5. **Consent** screen → choose what to share → **Give consent & continue**
6. **Shared journey** → see Patient / AI / Human / Caregiver all connected → **Open companion session**
7. Step through the companion session → **Complete session** → **Journey updated**
8. Visit **Support** (bottom nav) to see the safety boundary, then **View demo summary**

To see the **death-doula pathway** specifically: Home → What's next → Need someone to help → **End-of-Life Companion / Death Doula** → Explore support → Meera Rao's profile.

To see the **caregiver view**: Welcome → Continue as Caregiver (or Home → Caregiver card → View caregiver mode).

To see the **companion-side dashboard**: link at the bottom of the Welcome screen.

## Clinical safety boundary

The AI Care Companion is scoped to non-clinical navigation only. It never says things like "you have stage X cancer" or "you should take medicine X." Instead it handles appointment reminders, document checklists, transport/caregiver coordination, and "what's next?" — exactly as specified for this hackathon's non-clinical, operational/workflow track. This boundary is reinforced on the **Support & Safety** screen and via a persistent disclaimer on the AI Companion chat.

## Accessibility

- Minimum 48px touch targets on primary actions
- Visible focus states (`:focus-visible`) on all interactive elements
- Semantic headings, labelled icon-only buttons (e.g. back button)
- High-contrast teal/dark-teal palette on white backgrounds

## Notes on the mock data

All names, dates, and profiles (Ayesha Khan, Sara Khan, Priya Sharma, Arjun Mehta, Fatima Noor, Meera Rao, Sunrise Cancer Institute) are **entirely fictional** and used only to make the workflow legible for a live demo. No statistics or research claims are embedded in the app UI — evidence and citations belong in the accompanying pitch deck, not the product itself.
