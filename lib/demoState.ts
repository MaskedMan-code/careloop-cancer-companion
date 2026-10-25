import { z } from "zod";
import { todayTasks } from "./mockData";
import type { ConfirmedTaskInput, ConsentScope, Task } from "./types";
import { FinalResultSchema } from "./care-navigation/schema";

export const STORAGE_KEY = "careloop.demo.v2";
export const STORAGE_VERSION = 2;
const ScopeSchema = z.object({ appointmentDetails: z.boolean(), navigationTasks: z.boolean(), otherDocuments: z.boolean() }).strict();
const TaskSchema = z.object({
  id: z.string().min(1).max(100), label: z.string().trim().min(1).max(140), done: z.boolean(),
  status: z.enum(["pending", "completed"]), source: z.enum(["ai", "manual", "seed"]),
  confirmationStatus: z.literal("confirmed"), assignedTo: z.enum(["patient", "caregiver"]), sharedWithCaregiver: z.boolean(),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  origin: z.enum(["demo", "ai-extracted", "manual"]).optional(), category: z.string().max(50).optional(),
  dueText: z.string().max(280).nullable().optional(), sourceQuote: z.string().max(600).nullable().optional(), explicit: z.boolean().optional(),
}).strict().refine((t) => t.done === (t.status === "completed"), "Inconsistent task status");

export const DemoStateSchema = z.object({
  version: z.literal(STORAGE_VERSION), role: z.enum(["patient", "caregiver", "companion"]).nullable(),
  tasks: z.array(TaskSchema).max(200).refine((tasks) => new Set(tasks.map((t) => t.id)).size === tasks.length, "Duplicate IDs"),
  caregiverNotified: z.boolean(), caregiverSharing: z.object({ granted: z.boolean(), appointmentDetails: z.boolean(), navigationTasks: z.boolean() }).strict(),
  selectedCompanionType: z.enum(["hospital", "navigator", "family", "eol"]).nullable(),
  selectedCompanionId: z.enum(["priya-sharma", "arjun-mehta", "fatima-noor", "meera-rao"]).nullable(),
  consent: ScopeSchema, consentGiven: z.boolean(), companionSessionStep: z.number().int().min(0).max(4),
  confirmedAppointment: FinalResultSchema.shape.appointment.nullable(),
}).strict().refine((state) => !state.consentGiven || state.selectedCompanionId !== null, "Companion consent requires a selected profile");
export type StoredDemoState = z.infer<typeof DemoStateSchema>;
export type Role = StoredDemoState["role"];
export type AppointmentFacts = NonNullable<StoredDemoState["confirmedAppointment"]>;

export function initialDemoState(): StoredDemoState {
  return { version: STORAGE_VERSION, role: null, tasks: todayTasks.map((t) => ({ ...t })), caregiverNotified: false,
    caregiverSharing: { granted: false, appointmentDetails: true, navigationTasks: true },
    selectedCompanionType: null, selectedCompanionId: null,
    consent: { appointmentDetails: true, navigationTasks: true, otherDocuments: false }, consentGiven: false,
    companionSessionStep: 0, confirmedAppointment: null };
}

export function restoreDemoState(raw: string | null): StoredDemoState {
  if (!raw || raw.length > 500_000) return initialDemoState();
  try {
    const parsed = DemoStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : initialDemoState();
  } catch { return initialDemoState(); }
}

const normalized = (s: string) => s.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
export function mergeConfirmedTasks(tasks: Task[], items: ConfirmedTaskInput[], now: string, newId: () => string) {
  const keys = new Set(tasks.map((t) => `${normalized(t.label)}|${normalized(t.dueText ?? "")}`));
  const fresh: Task[] = [];
  let skipped = 0;
  for (const item of items) {
    const label = item.label.trim().replace(/\s+/g, " ").slice(0, 140);
    const key = `${normalized(label)}|${normalized(item.dueText ?? "")}`;
    if (!label || keys.has(key) || tasks.length + fresh.length >= 200) { skipped++; continue; }
    keys.add(key);
    const source = item.source ?? "ai";
    fresh.push({ id: newId(), label, done: false, status: "pending", source, origin: source === "ai" ? "ai-extracted" : "manual",
      confirmationStatus: "confirmed", category: item.category, dueText: item.dueText, sourceQuote: item.sourceQuote,
      explicit: item.explicit, assignedTo: item.assignedTo ?? "patient", sharedWithCaregiver: false, createdAt: now, updatedAt: now });
  }
  return { tasks: [...tasks, ...fresh], added: fresh.length, skipped };
}

export function sharedCaregiverTasks(state: StoredDemoState): Task[] {
  return state.caregiverSharing.granted && state.caregiverSharing.navigationTasks
    ? state.tasks.filter((t) => t.confirmationStatus === "confirmed" && t.sharedWithCaregiver) : [];
}

export type DemoAction =
  | { type: "toggleTask"; id: string; now: string; caregiver?: boolean }
  | { type: "updateTask"; id: string; patch: Partial<Pick<Task, "assignedTo" | "sharedWithCaregiver">>; now: string }
  | { type: "setConsent"; consent: ConsentScope }
  | { type: "revokeCaregiver" }
  | { type: "revokeCompanion" }
  | { type: "advanceSession" };

export function reduceDemo(state: StoredDemoState, action: DemoAction): StoredDemoState {
  switch (action.type) {
    case "toggleTask": {
      if (action.caregiver && !sharedCaregiverTasks(state).some((t) => t.id === action.id)) return state;
      return { ...state, tasks: state.tasks.map((t) => t.id === action.id ? { ...t, done: !t.done, status: t.done ? "pending" : "completed", updatedAt: action.now } : t) };
    }
    case "updateTask": return { ...state, tasks: state.tasks.map((t) => t.id === action.id ? { ...t, ...action.patch, updatedAt: action.now } : t) };
    case "setConsent": return { ...state, consent: action.consent };
    case "revokeCaregiver": return { ...state, caregiverSharing: { ...state.caregiverSharing, granted: false }, caregiverNotified: false };
    case "revokeCompanion": return { ...state, consentGiven: false };
    case "advanceSession": return state.consentGiven ? { ...state, companionSessionStep: Math.min(4, state.companionSessionStep + 1) } : state;
  }
}
