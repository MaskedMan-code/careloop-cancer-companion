import type {
  Appointment,
  Caregiver,
  Companion,
  DocumentItem,
  JourneyEvent,
  JourneyStep,
  Patient,
  Task,
} from "./types";

// All data below is fictional and for demonstration purposes only.

export const patient: Patient = {
  name: "Ayesha Khan",
  age: 52,
  condition: "Under active cancer-care navigation", // administrative framing only
};

export const caregiver: Caregiver = {
  name: "Sara Khan",
  relation: "Daughter",
};

export const nextAppointment: Appointment = {
  id: "appt-onco-1",
  title: "Oncology appointment",
  date: "24 Sept",
  time: "10:30 AM",
  hospital: "Sunrise Cancer Institute",
  location: "Oncology OPD, 2nd Floor",
};

export const journeySteps: JourneyStep[] = [
  {
    id: "registration",
    label: "Registration",
    status: "completed",
    date: "2 Sept",
    location: "Sunrise Cancer Institute",
    detail: "Patient registered with the care team.",
  },
  {
    id: "biopsy",
    label: "Biopsy",
    status: "completed",
    date: "9 Sept",
    location: "Sunrise Cancer Institute",
    detail: "Sample collection completed.",
  },
  {
    id: "pathology",
    label: "Pathology report received",
    status: "completed",
    date: "16 Sept",
    location: "Pathology Department",
    detail: "Report received and shared with your care team.",
    documents: ["Pathology report (shared with care team)"],
  },
  {
    id: "oncology-appt",
    label: "Oncology appointment",
    status: "current",
    date: "24 Sept",
    location: "Oncology OPD, 2nd Floor",
    detail: "Discussion with your oncology team about next steps.",
    documents: ["Appointment slip", "Pathology report copy"],
  },
  {
    id: "imaging",
    label: "Imaging",
    status: "pending",
    detail: "To be scheduled after the oncology appointment.",
  },
  {
    id: "followup",
    label: "Follow-up scheduling",
    status: "pending",
    detail: "Will be organized once next steps are confirmed.",
  },
];

export const todayTasks: Task[] = [
  { id: "t1", label: "Confirm appointment", done: false },
  { id: "t2", label: "Prepare requested documents", done: false },
  { id: "t3", label: "Arrange transport", done: false },
  { id: "t4", label: "Notify caregiver", done: false },
];

export const caregiverTasks: Task[] = [
  { id: "c1", label: "Confirm transport", done: false },
  { id: "c2", label: "Carry pathology document", done: false },
  { id: "c3", label: "Attend oncology appointment", done: false },
];

export const documents: DocumentItem[] = [
  {
    id: "doc1",
    type: "Appointment slip",
    title: "Oncology appointment",
    date: "24 Sept",
    location: "Oncology OPD",
    action: "Attend appointment",
    preparation: "Carry requested documents",
  },
];

export const documentTypes = [
  "Appointment slip",
  "Hospital instruction",
  "Referral document",
  "Discharge instruction",
];

export const companions: Companion[] = [
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    role: "Verified Care Companion",
    type: "hospital",
    verified: true,
    trained: true,
    languages: ["Hindi", "English"],
    experience: "Hospital accompaniment",
    availability: "Tomorrow, 9:00 AM",
    services: ["Hospital navigation", "Accompaniment"],
  },
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    role: "Verified Cancer Care Navigator",
    type: "navigator",
    verified: true,
    trained: true,
    languages: ["English", "Marathi"],
    experience: "Care coordination across departments",
    availability: "Today, 4:00 PM",
    services: ["Journey coordination", "Appointment navigation"],
  },
  {
    id: "fatima-noor",
    name: "Fatima Noor",
    role: "Verified Practical Support Companion",
    type: "family",
    verified: true,
    trained: true,
    languages: ["Hindi", "Urdu", "English"],
    experience: "Family and practical coordination",
    availability: "Tomorrow, 11:00 AM",
    services: ["Errands & logistics", "Family coordination"],
  },
  {
    id: "meera-rao",
    name: "Meera Rao",
    role: "Verified End-of-Life Companion",
    type: "eol",
    verified: true,
    trained: true,
    languages: ["Hindi", "English"],
    experience: "Non-clinical end-of-life support",
    availability: "Available today",
    services: [
      "Companionship",
      "Practical family support",
      "Resource navigation",
      "Family presence",
    ],
  },
];

export const journeyEventsShared: JourneyEvent[] = [
  { id: "e1", label: "Human companion assigned", timestamp: "Just now" },
  { id: "e2", label: "Patient consent recorded", timestamp: "Just now" },
  { id: "e3", label: "Hospital accompaniment scheduled", timestamp: "Just now" },
];

export const companionHumanTypes = [
  {
    type: "hospital" as const,
    title: "Hospital Companion",
    description: "Help me navigate and attend the hospital.",
  },
  {
    type: "navigator" as const,
    title: "Cancer Care Navigator",
    description: "Help coordinate my care journey.",
  },
  {
    type: "family" as const,
    title: "Family / Practical Support",
    description: "Help with practical coordination.",
  },
  {
    type: "eol" as const,
    title: "End-of-Life Companion / Death Doula",
    description:
      "Non-clinical companionship and family support during end-of-life.",
  },
];
