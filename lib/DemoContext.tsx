"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { companions } from "./mockData";
import type { ConfirmedTaskInput, ConsentScope, Task } from "./types";
import { initialDemoState, mergeConfirmedTasks, reduceDemo, restoreDemoState, sharedCaregiverTasks, STORAGE_KEY, type AppointmentFacts, type Role, type StoredDemoState } from "./demoState";
export type { Role } from "./demoState";

function useDemoValue() {
  const [state, setState] = useState(initialDemoState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const replace = useCallback((next: StoredDemoState) => { stateRef.current = next; setState(next); }, []);
  const change = (fn: (s: StoredDemoState) => StoredDemoState) => replace(fn(stateRef.current));

  useEffect(() => {
    try { replace(restoreDemoState(localStorage.getItem(STORAGE_KEY))); }
    catch { setStorageAvailable(false); }
    setReady(true);
  }, [replace]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { setStorageAvailable(false); }
  }, [state, ready]);

  const now = () => new Date().toISOString();
  const toggleTask = (id: string) => change((s) => reduceDemo(s, { type: "toggleTask", id, now: now() }));
  return {
    ...state, ready, storageAvailable,
    setRole: (role: Role) => change((s) => ({ ...s, role })),
    toggleTask,
    updateTask: (id: string, patch: Partial<Pick<Task, "assignedTo" | "sharedWithCaregiver">>) => change((s) => reduceDemo(s, { type: "updateTask", id, patch, now: now() })),
    addConfirmedTasks: (items: ConfirmedTaskInput[]) => {
      const result = mergeConfirmedTasks(stateRef.current.tasks, items, now(), () => `task-${crypto.randomUUID()}`);
      change((s) => ({ ...s, tasks: result.tasks }));
      return { added: result.added, skipped: result.skipped };
    },
    confirmAppointment: (facts: AppointmentFacts) => change((s) => ({ ...s, confirmedAppointment: facts })),
    caregiverTasks: sharedCaregiverTasks(state),
    toggleCaregiverTask: (id: string) => change((s) => reduceDemo(s, { type: "toggleTask", id, now: now(), caregiver: true })),
    notifyCaregiver: () => change((s) => ({ ...s, caregiverNotified: s.caregiverSharing.granted })),
    setCaregiverSharing: (patch: Partial<StoredDemoState["caregiverSharing"]>) => change((s) => ({ ...s, caregiverSharing: { ...s.caregiverSharing, ...patch } })),
    revokeCaregiver: () => change((s) => reduceDemo(s, { type: "revokeCaregiver" })),
    setSelectedCompanionType: (type: string | null) => change((s) => ({ ...s, selectedCompanionType: ["hospital", "navigator", "family", "eol"].includes(type ?? "") ? type as StoredDemoState["selectedCompanionType"] : null })),
    setSelectedCompanionId: (id: string | null) => change((s) => ({ ...s, selectedCompanionId: companions.some((c) => c.id === id) ? id as StoredDemoState["selectedCompanionId"] : null })),
    setConsent: (consent: ConsentScope) => change((s) => reduceDemo(s, { type: "setConsent", consent })),
    giveConsent: () => change((s) => ({ ...s, consentGiven: s.selectedCompanionId !== null })),
    revokeCompanion: () => change((s) => reduceDemo(s, { type: "revokeCompanion" })),
    humanCompanionAdded: state.consentGiven && state.selectedCompanionId !== null,
    advanceCompanionSession: () => change((s) => reduceDemo(s, { type: "advanceSession" })),
    resetDemo: () => { try { localStorage.removeItem(STORAGE_KEY); } catch { setStorageAvailable(false); } replace(initialDemoState()); },
  };
}
const DemoContext = createContext<ReturnType<typeof useDemoValue> | undefined>(undefined);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const value = useDemoValue();
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
export function findCompanion(id: string | null) { return companions.find((c) => c.id === id); }
export function companionsByType(type: string | null) { return type ? companions.filter((c) => c.type === type) : companions; }
