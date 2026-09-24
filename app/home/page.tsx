"use client";

import { CalendarClock, MapPin, MessageCircle, Route, Users } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/Card";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/Buttons";
import { caregiver, journeySteps, nextAppointment, patient } from "@/lib/mockData";

export default function PatientHome() {
  const pending = journeySteps.filter((s) => s.status === "pending");
  const upcoming = journeySteps.filter(
    (s) => s.status === "current" || s.status === "next"
  );

  return (
    <PageShell>
      <p className="text-sm text-care-muted">Good morning,</p>
      <h1 className="mb-5 font-serif text-2xl font-bold text-care-text">
        {patient.name.split(" ")[0]}
      </h1>

      <Card tint className="border-care-teal/30">
        <p className="text-[11px] font-bold uppercase tracking-wider text-care-teal">
          Next step
        </p>
        <p className="mt-1 font-serif text-lg font-bold text-care-text">
          {nextAppointment.title} tomorrow
        </p>
        <div className="mt-3 space-y-1.5 text-sm text-care-text">
          <p className="flex items-center gap-2">
            <CalendarClock size={15} className="text-care-teal" />
            {nextAppointment.date} · {nextAppointment.time}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} className="text-care-teal" />
            {nextAppointment.hospital} — {nextAppointment.location}
          </p>
        </div>

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

      <div className="mt-5 grid grid-cols-1 gap-3">
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Upcoming</p>
          {upcoming.map((s) => (
            <p key={s.id} className="text-sm text-care-muted">
              • {s.label}
            </p>
          ))}
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Pending</p>
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
            {caregiver.name} ({caregiver.relation}) is coordinating with you.
          </p>
          <div className="mt-3">
            <GhostButton href="/caregiver" className="!py-2 !text-sm">
              View caregiver mode
            </GhostButton>
          </div>
        </Card>
      </div>

      <BottomNav />
    </PageShell>
  );
}
