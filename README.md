# CareLoop

### Continuous care, beyond the hospital.

**CareLoop** is a dual-mode **AI + Human Cancer Care Companion** for patients and caregivers, built for **Health-a-thon 2026** by Koita Foundation, KCDH-IIT Bombay and National Cancer Grid.

Cancer care is a continuous journey, but support is often fragmented across appointments, documents, hospital processes, caregivers and home. CareLoop creates **one shared journey** where an AI companion helps with non-clinical navigation and coordination, while verified human companions can step in when a patient needs physical, practical or emotional support.

> **AI when you need guidance. Human when you need presence.**

---

## 🚀 Live Demo

**Prototype:**  
https://careloop-cancer-companion.vercel.app/

**GitHub Repository:**  
https://github.com/MaskedMan-code/careloop-cancer-companion

---

## 💡 What is CareLoop?

CareLoop is designed around one simple principle:

> **One patient journey. Multiple forms of support.**

Instead of making patients repeatedly explain their situation to different people and systems, CareLoop keeps a shared journey that can be accessed by the patient, caregiver and appropriate support companions with patient consent.

### AI Care Companion

The AI companion provides always-available, **non-clinical** support for:

- appointment and task organization
- document and instruction organization
- reminders and checklists
- “What's next?” guidance
- multilingual communication
- caregiver coordination
- preparation for healthcare visits
- navigation through non-clinical hospital processes

### Human Companion Network

When digital support is not enough, CareLoop can connect patients with verified human companions such as:

- **Hospital Companion**
- **Cancer Care Navigator**
- **Family / Practical Support**
- **End-of-Life Companion / Death Doula**

### End-of-Life / Death Doula

CareLoop includes a dedicated pathway for appropriately trained, verified, **non-clinical end-of-life companions / death doulas**.

Support may include:

- companionship and presence
- practical support
- psychosocial / emotional support
- resource navigation
- family support during end-of-life

Death doulas complement clinical care. They do not replace doctors, nurses, palliative-care teams or hospice services.

---

## 🔄 The Core Differentiator

The AI companion and human companion are **not separate products**.

They share the **same CareLoop journey**.

```text
Patient / Caregiver
        │
        ▼
  CARELOOP JOURNEY
        │
   ┌────┴────┐
   ▼         ▼
 AI        HUMAN
Companion  Companion
   │         │
   └────┬────┘
        ▼
 Healthcare Team

For example:

“I need someone with me.”

With patient consent, a human companion can join the same CareLoop journey.

The patient does not have to start over or repeat everything.

Nothing is repeated or lost.

🧭 Example Patient Journey

The prototype uses a fictional patient:

Ayesha Khan
Age: 52

Caregiver:

Sara Khan

Completed
Registration
Biopsy
Pathology received
Current
Oncology appointment
Next
Prepare requested documents
Confirm appointment
Arrange transport
Notify caregiver
Pending
Imaging
Follow-up scheduling

The prototype intentionally keeps this journey non-clinical. It does not interpret pathology or make treatment decisions.

🖥️ Prototype Walkthrough

The prototype demonstrates the complete CareLoop workflow.

Recommended demo
Welcome → Continue as Patient
Home → Open “What's Next?”
Review the appointment preparation checklist
Select “Need someone to help”
Choose Hospital Companion
View a companion profile
Request a companion
Review the Consent screen
Select the information to share
Open the Shared CareLoop Journey
Complete the companion session
See the journey update
Death-doula pathway
Home
→ What's Next?
→ Need someone to help
→ End-of-Life Companion / Death Doula
→ Explore support
→ Companion profile
Caregiver pathway
Welcome
→ Continue as Caregiver

or access the caregiver view from the patient journey.

Companion dashboard

The prototype also includes a companion-side dashboard showing assigned journeys, tasks and consent status.

🧠 AI Companion

The prototype demonstrates how fragmented, non-clinical information can be turned into clear next actions.

Documents
Instructions
Appointments
Care tasks
       ↓
AI Journey Engine
       ↓
Completed | Current | Next | Pending
       ↓
Reminders
Checklists
Translation
Caregiver coordination
       ↓
“What’s next?”
Example

Oncology appointment tomorrow

CareLoop can help the patient:

prepare requested documents
confirm the appointment
arrange transport
notify the caregiver

It does not diagnose or recommend treatment.

👥 Human Companion Network

Some problems cannot be solved by software.

CareLoop can support different kinds of non-clinical companions:

Companion	Purpose
Hospital Companion	Hospital accompaniment and navigation
Cancer Care Navigator	Practical coordination across the journey
Family / Practical Support	Everyday coordination and caregiver support
End-of-Life Companion / Death Doula	Non-clinical companionship and family support during end-of-life

Companions are intended to be verified and appropriately trained for their non-clinical role.

Clinical decisions remain with healthcare professionals.

🔐 Consent & Privacy

CareLoop is designed around patient-controlled information sharing.

Before a human companion joins the journey, the patient can choose what information to share.

The prototype demonstrates:

explicit consent before sharing
role-based access
limited information sharing
consent status within the shared journey
audit-oriented architecture for future implementation

Example:

Share your CareLoop journey?

☑ Appointment details
☑ Navigation tasks
☐ Other documents

[ Give consent & continue ]

Only the information the patient chooses to share should be visible to the companion.

🩺 Clinical Safety Boundary

CareLoop is an assistive, non-clinical workflow solution.

AI handles
Organization
Navigation
Communication
Reminders
Coordination
Human companions handle
Presence
Practical support
Hospital navigation
Non-clinical companionship
Family support
End-of-life companionship
Healthcare professionals handle
Diagnosis
Treatment
Clinical decisions

CareLoop does not:

diagnose
recommend treatment
interpret medical results for clinical decisions
perform clinical risk scoring
provide autonomous clinical advice
replace doctors, nurses, palliative-care teams or hospice
🛠️ Technology

The current prototype is built with:

Next.js 14 — App Router
React 18
TypeScript
Tailwind CSS
lucide-react for icons
Prototype data

The current prototype uses local fictional mock data.

There are:

no real patient records
no real healthcare API integrations
no real payments
no real background-check integrations
no clinical decision-making

The data model is separated from the UI so that the prototype can later be connected to a backend such as Supabase/PostgreSQL without restructuring the product experience.

/lib/mockData.ts
/lib/types.ts
/lib/DemoContext.tsx
📁 Project Structure
app/
├── page.tsx                      # Welcome / role selection
├── home/                         # Patient home
├── journey/                      # Care journey timeline
├── whats-next/                   # “What's next?” interaction
├── documents/                    # Document / instruction organization
├── companion/                    # AI Care Companion
├── caregiver/                    # Caregiver mode
├── human-companion/              # Human support selection
├── end-of-life/                  # End-of-life pathway
├── consent/                      # Consent handoff
├── shared-journey/               # Shared journey view
├── companion-session/            # Companion session
├── after-support/                # Journey update
├── support/                      # Safety boundary
├── companion-dashboard/          # Companion-side dashboard
└── end/                          # Demo summary

components/
└── Reusable UI components

lib/
├── mockData.ts
├── types.ts
└── DemoContext.tsx
♿ Accessibility

The prototype includes:

large touch targets for primary actions
visible :focus-visible states
semantic headings
labelled interactive controls
readable contrast
responsive layouts
🧪 Pilot & Future Direction

CareLoop is currently a prototype.

A future pilot could begin in one cancer-care setting with a small patient/caregiver cohort and be co-designed with:

practising doctors
nurses
patients
caregivers
palliative-care professionals
end-of-life professionals
human care companions

Potential measures to validate include:

ability to identify the next step
patient preparedness
caregiver coordination burden
missed or incomplete navigation tasks
successful human-support connections
continuity across care transitions

These are proposed measures to validate, not claimed results.

📚 Evidence & Design Rationale

The CareLoop concept is informed by literature on end-of-life companionship and death-doula roles.

The supporting research describes roles including companionship, practical support, psychosocial/emotional support and resource navigation, while also noting that the evidence base for clinical outcomes remains limited.

The prototype therefore focuses on the non-clinical support role and does not claim that death doulas improve survival or reduce mortality.

Any research statistics used in the accompanying Health-a-thon pitch deck are presented as contextual evidence and not as evidence of CareLoop's effectiveness.

🎯 Health-a-thon 2026

CareLoop was created for Health-a-thon 2026 by Koita Foundation, KCDH-IIT Bombay and National Cancer Grid.

The prototype focuses on the hackathon's assistive, non-clinical, operational and workflow direction.

The core idea

AI when you need guidance.
Human when you need presence.

The final principle

CareLoop does not replace the care team. It makes the journey around the care team easier to navigate.

Because...

Nobody should have to navigate cancer alone.

▶️ Run Locally

Clone the repository:

git clone https://github.com/MaskedMan-code/careloop-cancer-companion.git
cd careloop-cancer-companion

Install dependencies:

npm install

Start the development server:

npm run dev

Open:

http://localhost:3000

For a production build:

npm run build
npm run start
📌 Prototype Status

Status: Health-a-thon 2026 prototype

Data: Fictional / mock

Clinical use: Not for clinical decision-making

Live demo: https://careloop-cancer-companion.vercel.app/

Repository: https://github.com/MaskedMan-code/careloop-cancer-companion
