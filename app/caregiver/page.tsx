"use client";

import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import TaskChecklist from "@/components/TaskChecklist";
import AppointmentCard from "@/components/AppointmentCard";
import BottomNav from "@/components/BottomNav";
import { SecondaryButton } from "@/components/Buttons";
import { useDemo } from "@/lib/DemoContext";
import { caregiver, patient } from "@/lib/mockData";

export default function CaregiverPage() {
  const { caregiverTasks, toggleCaregiverTask, caregiverSharing } = useDemo();
  const pending = caregiverTasks.filter((task) => !task.done);
  const completed = caregiverTasks.filter((task) => task.done);
  const assigned = pending.filter((task) => task.assignedTo === "caregiver");
  return <PageShell>
    <Header title={`${patient.name.split(" ")[0]}'s Care Journey`} subtitle={`Caregiver demo · ${caregiver.name}`} backHref="/home" />
    <p role="status" className="mb-4 rounded-xl border border-care-border bg-care-tint p-3 text-sm font-semibold text-care-teal">{caregiverSharing.granted ? "Demo sharing is active. Only selected tasks and permitted details appear." : "Sharing is off. No appointment or tasks are shared."}</p>
    <AppointmentCard caregiver />
    <div className="mb-6 grid grid-cols-3 gap-3">{[["Pending", pending.length], ["Completed", completed.length], ["Assigned to Sara", assigned.length]].map(([label, count]) => <Card key={label}><p className="text-2xl font-bold text-care-teal">{count}</p><p className="mt-1 text-sm text-care-muted">{label}</p></Card>)}</div>
    <h2 className="mb-3 font-serif text-xl font-bold">Shared preparation checklist</h2>
    {caregiverTasks.length ? <TaskChecklist tasks={[...pending, ...completed]} onToggle={toggleCaregiverTask} /> : <Card><p className="font-semibold">No shared tasks yet</p><p className="mt-2 text-sm text-care-muted">The patient can choose tasks in What&rsquo;s next, then grant demo sharing. Assigning a task alone does not share it.</p></Card>}
    <div className="mt-5"><SecondaryButton href="/consent?target=caregiver">Manage demo sharing as patient</SecondaryButton></div>
    <p className="mt-5 text-sm text-care-muted">This is a single-browser demonstration. Secure privacy enforcement and true multi-user synchronization require a backend. Nothing is sent to Sara.</p>
    <BottomNav />
  </PageShell>;
}
