"use client";

import { CalendarClock, Car, FileText, ShieldCheck } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import TaskChecklist from "@/components/TaskChecklist";
import { useDemo } from "@/lib/DemoContext";
import { caregiver, nextAppointment, patient } from "@/lib/mockData";

export default function CaregiverPage() {
  const { caregiverTasks, toggleCaregiverTask } = useDemo();

  return (
    <PageShell withBottomPadding={false}>
      <Header
        title={`${patient.name.split(" ")[0]}'s Care Journey`}
        subtitle={`Caregiver view — ${caregiver.name}`}
        backHref="/"
      />

      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-care-green/15 px-3 py-1.5 text-xs font-semibold text-care-green">
        <ShieldCheck size={14} /> Shared with your consent.
      </div>

      <Card tint className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-care-teal">
          Next appointment
        </p>
        <p className="mt-1 flex items-center gap-2 font-semibold text-care-text">
          <CalendarClock size={15} /> {nextAppointment.title} — {nextAppointment.date},{" "}
          {nextAppointment.time}
        </p>
        <p className="mt-1 text-sm text-care-muted">
          {nextAppointment.hospital}, {nextAppointment.location}
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-care-text">
            <FileText size={14} className="text-care-teal" /> Shared documents
          </p>
          <p className="text-sm text-care-muted">Pathology report copy, appointment slip</p>
        </Card>
        <Card>
          <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-care-text">
            <Car size={14} className="text-care-teal" /> Transport
          </p>
          <p className="text-sm text-care-muted">Not yet arranged</p>
        </Card>
      </div>

      <p className="mb-2 text-sm font-bold text-care-text">Tasks for Sara</p>
      <TaskChecklist tasks={caregiverTasks} onToggle={toggleCaregiverTask} />

      <p className="mt-6 text-center text-xs text-care-muted">
        Sara can only see the journey information Ayesha has chosen to share.
      </p>
    </PageShell>
  );
}
