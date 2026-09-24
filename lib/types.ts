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

export interface Task {
  id: string;
  label: string;
  done: boolean;
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
