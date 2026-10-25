"use client";

import { FileSearch, MessageCircle, Route, Users } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/Card";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/Buttons";
import { caregiver, journeySteps, patient } from "@/lib/mockData";
import AppointmentCard from "@/components/AppointmentCard";
import { useDemo } from "@/lib/DemoContext";

export default function PatientHome() {
  const { tasks, caregiverSharing } = useDemo();
  const pending = journeySteps.filter((s) => s.status === "pending");
  const upcoming = journeySteps.filter(
    (s) => s.status === "current" || s.status === "next"
  );

  return (
    <PageShell>
      <p className="text-sm text-care-muted">Your care, one step at a time</p>
      <h1 className="mb-5 font-serif text-2xl font-bold text-care-text">
        {patient.name.split(" ")[0]}
      </h1>

      <AppointmentCard />
      <Card tint className="border-care-teal/30">
        <p className="text-[11px] font-bold uppercase tracking-wider text-care-teal">
          Prepare together
        </p>
        <p className="mt-1 font-serif text-lg font-bold text-care-text">
          {tasks.filter((t) => !t.done).length} tasks to prepare for your visit
        </p>
        <div className="mt-4 space-y-2">
          <PrimaryButton href="/whats-next">What&rsquo;s next?</PrimaryButton>
          <div className="grid grid-cols-2 gap-2">
            <SecondaryButton href="/journey" icon={<Route size={16} />}>
              View journey
            </SecondaryButton>
            <SecondaryButton href="/companion" icon={<MessageCircle size={16} />}>
              Ask Companion
            </SecondaryButton>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <p className="mb-1 flex items-center gap-2 text-sm font-bold text-care-text">
            <FileSearch size={15} className="text-care-teal" /> Add a document or instruction
          </p>
          <p className="text-sm text-care-muted">
            Paste appointment text and CareLoop AI lists the administrative steps for you to review.
          </p>
          <div className="mt-3">
            <GhostButton href="/documents" className="!py-2 !text-sm">
              Read my appointment text
            </GhostButton>
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Upcoming example milestones</p>
          {upcoming.map((s) => (
            <p key={s.id} className="text-sm text-care-muted">
              • {s.label}
            </p>
          ))}
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Unscheduled example milestones</p>
          {pending.map((s) => (
            <p key={s.id} className="text-sm text-care-muted">
              • {s.label}
            </p>
          ))}
        </Card>
        <Card>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-care-text">
            <Users size={15} className="text-care-teal" /> Caregiver
          </p>
          <p className="text-sm text-care-muted">
            {caregiver.name} ({caregiver.relation}). {caregiverSharing.granted ? "Demo sharing is active." : "You choose what to share."}
          </p>
          <div className="mt-3">
            <GhostButton href="/caregiver" className="!py-2 !text-sm">
              View caregiver mode
            </GhostButton>
            <GhostButton href="/consent?target=caregiver" className="!py-2 !text-sm">Manage sharing</GhostButton>
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><SecondaryButton href="/human-companion">Find a human companion</SecondaryButton><SecondaryButton href="/support">Privacy &amp; non-clinical support</SecondaryButton></div>

      <BottomNav />
    </PageShell>
  );
}
