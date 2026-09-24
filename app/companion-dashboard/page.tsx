import { CalendarDays, ClipboardList, ShieldCheck, Users } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { GhostButton } from "@/components/Buttons";
import { nextAppointment, patient } from "@/lib/mockData";

export default function CompanionDashboardPage() {
  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="Companion dashboard"
        subtitle="Priya Sharma — Verified Care Companion"
        backHref="/"
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-care-teal">
            <CalendarDays size={13} /> Today
          </p>
          <p className="text-sm text-care-muted">No sessions scheduled today</p>
        </Card>
        <Card>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-care-teal">
            <ClipboardList size={13} /> Upcoming
          </p>
          <p className="text-sm text-care-muted">1 assignment tomorrow</p>
        </Card>
      </div>

      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-care-text">
        <Users size={15} className="text-care-teal" /> Assigned patients
      </p>
      <Card className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-care-text">{patient.name}</p>
            <p className="text-sm text-care-muted">Hospital accompaniment</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-care-green/15 px-2.5 py-1 text-[11px] font-semibold text-care-green">
            <ShieldCheck size={12} /> Consent: Granted
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-care-tint px-3 py-2">
            <p className="text-[11px] text-care-muted">Appointment</p>
            <p className="font-medium text-care-text">
              {nextAppointment.date}, {nextAppointment.time}
            </p>
          </div>
          <div className="rounded-lg bg-care-tint px-3 py-2">
            <p className="text-[11px] text-care-muted">Journey tasks</p>
            <p className="font-medium text-care-text">2 pending</p>
          </div>
        </div>
        <div className="mt-3">
          <GhostButton href="/companion-session" className="!py-2 !text-sm">
            Open session
          </GhostButton>
        </div>
      </Card>

      <p className="text-center text-xs text-care-muted">
        Companions see only what patients have consented to share — no
        clinical information is exposed here.
      </p>
    </PageShell>
  );
}
