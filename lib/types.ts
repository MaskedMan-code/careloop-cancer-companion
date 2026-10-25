export type TaskStatus = "completed" | "current" | "next" | "pending";

export interface JourneyStep {
  id: string;
  label: string;
  status: TaskStatus;
  date?: string;
  location?: string;
  detail?: string;
  documents?: string[];
}

export type TaskOrigin = "demo" | "ai-extracted" | "manual";

export interface Task {
  id: string;
  label: string;
  done: boolean;
  status: "pending" | "completed";
  source: "ai" | "manual" | "seed";
  confirmationStatus: "confirmed";
  assignedTo: "patient" | "caregiver";
  sharedWithCaregiver: boolean;
  createdAt: string;
  updatedAt: string;
  /** Absent/"demo" for the original seeded tasks. "ai-extracted" = confirmed by the patient from the AI extractor. */
  origin?: TaskOrigin;
  category?: string;
  /** Verbatim date/time phrase from the source text, if any. */
  dueText?: string | null;
  /** Verbatim supporting quotation from the source text (explicit tasks only). */
  sourceQuote?: string | null;
  /** true = stated in the source text; false = optional generic suggestion the patient accepted. */
  explicit?: boolean;
}

/** What the patient confirms in the UI before a task is added to the journey. */
export interface ConfirmedTaskInput {
  label: string;
  category: string;
  dueText: string | null;
  sourceQuote: string | null;
  explicit: boolean;
  assignedTo?: "patient" | "caregiver";
  source?: "ai" | "manual";
}

export interface DocumentItem {
  id: string;
  type: string;
  title: string;
  date: string;
  location?: string;
  action: string;
  preparation: string;
}

export type CompanionType =
  | "hospital"
  | "navigator"
  | "family"
  | "eol";

export interface Companion {
  id: string;
  name: string;
  role: string;
  type: CompanionType;
  verified: boolean;
  trained: boolean;
  languages: string[];
  experience: string;
  availability: string;
  services?: string[];
}

export interface ConsentScope {
  appointmentDetails: boolean;
  navigationTasks: boolean;
  otherDocuments: boolean;
}

export interface JourneyEvent {
  id: string;
  label: string;
  timestamp: string;
}

export interface Patient {
  name: string;
  age: number;
  condition: string; // kept purely administrative, no clinical detail
}

export interface Caregiver {
  name: string;
  relation: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  hospital: string;
  location: string;
}
