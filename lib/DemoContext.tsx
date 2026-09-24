"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  caregiverTasks as caregiverTasksSeed,
  companions,
  todayTasks as todayTasksSeed,
} from "./mockData";
import type { ConsentScope, Task } from "./types";

export type Role = "patient" | "caregiver" | "companion" | null;

interface DemoState {
  role: Role;
  setRole: (r: Role) => void;

  tasks: Task[];
  toggleTask: (id: string) => void;

  caregiverTasks: Task[];
  toggleCaregiverTask: (id: string) => void;

  caregiverNotified: boolean;
  notifyCaregiver: () => void;

  selectedCompanionType: string | null;
  setSelectedCompanionType: (t: string | null) => void;

  selectedCompanionId: string | null;
  setSelectedCompanionId: (id: string | null) => void;

  consent: ConsentScope;
  setConsent: (c: ConsentScope) => void;
  consentGiven: boolean;
  giveConsent: () => void;

  humanCompanionAdded: boolean;

  companionSessionStep: number;
  advanceCompanionSession: () => void;
}

const DemoContext = createContext<DemoState | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [tasks, setTasks] = useState<Task[]>(todayTasksSeed);
  const [caregiverTasksState, setCaregiverTasksState] = useState<Task[]>(
    caregiverTasksSeed
  );
  const [caregiverNotified, setCaregiverNotified] = useState(false);
  const [selectedCompanionType, setSelectedCompanionType] = useState<
    string | null
  >(null);
  const [selectedCompanionId, setSelectedCompanionId] = useState<
    string | null
  >(null);
  const [consent, setConsent] = useState<ConsentScope>({
    appointmentDetails: true,
    navigationTasks: true,
    otherDocuments: false,
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [companionSessionStep, setCompanionSessionStep] = useState(0);

  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const toggleCaregiverTask = (id: string) =>
    setCaregiverTasksState((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const notifyCaregiver = () => setCaregiverNotified(true);

  const giveConsent = () => setConsentGiven(true);

  const advanceCompanionSession = () =>
    setCompanionSessionStep((s) => Math.min(s + 1, 4));

  const value = useMemo(
    () => ({
      role,
      setRole,
      tasks,
      toggleTask,
      caregiverTasks: caregiverTasksState,
      toggleCaregiverTask,
      caregiverNotified,
      notifyCaregiver,
      selectedCompanionType,
      setSelectedCompanionType,
      selectedCompanionId,
      setSelectedCompanionId,
      consent,
      setConsent,
      consentGiven,
      giveConsent,
      humanCompanionAdded: consentGiven,
      companionSessionStep,
      advanceCompanionSession,
    }),
    [
      role,
      tasks,
      caregiverTasksState,
      caregiverNotified,
      selectedCompanionType,
      selectedCompanionId,
      consent,
      consentGiven,
      companionSessionStep,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

export function findCompanion(id: string | null) {
  if (!id) return undefined;
  return companions.find((c) => c.id === id);
}

export function companionsByType(type: string | null) {
  if (!type) return companions;
  return companions.filter((c) => c.type === type);
}
