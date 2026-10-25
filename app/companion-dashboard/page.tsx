"use client";

import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import AppointmentCard from "@/components/AppointmentCard";
import TaskChecklist from "@/components/TaskChecklist";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { useDemo, findCompanion } from "@/lib/DemoContext";

export default function CompanionDashboardPage() {
  const { consentGiven, consent, selectedCompanionId, tasks, companionSessionStep } = useDemo();
  const companion = findCompanion(selectedCompanionId);
  const active = consentGiven && !!companion;
  const shared = active && consent.navigationTasks ? tasks.filter((task) => task.sharedWithCaregiver) : [];
  return <PageShell withBottomPadding={false}>
    <Header title="Companion dashboard" subtitle={companion ? `${companion.name} · fictional demo profile` : "Fictional companion preview"} backHref="/home" />
    <Card className="mb-5"><p className="font-semibold">{active ? "Demo consent is active" : "No active companion sharing"}</p><p className="mt-2 text-sm text-care-muted">Profiles, availability and session activity are fictional. No real booking, verification or messages.</p></Card>
    {active && <>
      {consent.appointmentDetails ? <AppointmentCard /> : <p className="mb-4 text-care-muted">Appointment details are not shared.</p>}
      <h2 className="mb-3 font-serif text-xl font-bold">Shared administrative tasks</h2>
      {shared.length ? <TaskChecklist tasks={shared} /> : <Card>No tasks shared in this scope.</Card>}
      <p className="my-4 text-sm text-care-muted">Demo session: {companionSessionStep} of 4 steps completed.</p>
      <PrimaryButton href="/companion-session">Open session</PrimaryButton>
    </>}
    <div className="mt-4"><SecondaryButton href="/consent">Manage companion consent</SecondaryButton></div>
  </PageShell>;
}
