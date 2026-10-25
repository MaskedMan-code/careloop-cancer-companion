"use client";

import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import TaskChecklist from "@/components/TaskChecklist";
import AppointmentCard from "@/components/AppointmentCard";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { useDemo, findCompanion } from "@/lib/DemoContext";

export default function SharedJourneyPage() {
  const { consent, consentGiven, selectedCompanionId, tasks } = useDemo();
  const companion = findCompanion(selectedCompanionId);
  const active = consentGiven && !!companion;
  const shared = active && consent.navigationTasks ? tasks.filter((task) => task.sharedWithCaregiver) : [];
  return <PageShell withBottomPadding={false}>
    <Header title="One shared journey" subtitle="A local preview of the information you chose to share." backHref="/consent" />
    {active ? <>
      <Card className="mb-5"><p className="font-semibold">Patient consent recorded</p><p className="mt-2 text-sm text-care-muted">{companion.name} · fictional companion. No booking or real sharing has occurred.</p></Card>
      {consent.appointmentDetails ? <AppointmentCard /> : <p className="mb-5 text-care-muted">Appointment details are not shared.</p>}
      <h2 className="mb-3 font-serif text-xl font-bold">Selected preparation tasks</h2>
      {shared.length ? <TaskChecklist tasks={shared} /> : <Card>No tasks included in this sharing scope.</Card>}
      <div className="mt-5"><PrimaryButton href="/companion-session">Open companion session</PrimaryButton></div>
    </> : <Card><p className="font-semibold">Sharing is off</p><p className="mt-2 text-sm text-care-muted">Grant companion consent to preview a shared journey.</p></Card>}
    <div className="mt-4"><SecondaryButton href="/consent">Manage companion consent</SecondaryButton></div>
  </PageShell>;
}
