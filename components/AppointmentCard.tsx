"use client";

import { useDemo } from "@/lib/DemoContext";
import { nextAppointment } from "@/lib/mockData";
import { DEMO_APPOINTMENT_DATE, relativeDemoDate } from "@/lib/demoCalendar";
import Card from "./Card";

export default function AppointmentCard({ caregiver = false }: { caregiver?: boolean }) {
  const { confirmedAppointment: facts, caregiverSharing } = useDemo();
  if (caregiver && (!caregiverSharing.granted || !caregiverSharing.appointmentDetails)) {
    return <Card tint className="mb-5"><p className="font-semibold">Appointment details are not shared.</p><p className="mt-1 text-sm text-care-muted">The patient can change the demo sharing scope.</p></Card>;
  }
  return <Card tint className="mb-5 border-care-teal/30">
    <p className="text-xs font-bold uppercase tracking-wide text-care-teal">{facts ? "Source appointment · reviewed and confirmed" : "Seeded example appointment"}</p>
    <h2 className="mt-2 font-serif text-xl font-bold">{facts ? facts.title?.value ?? "Appointment from your instructions" : nextAppointment.title}</h2>
    <p className="mt-2 text-base font-semibold">{facts ? facts.date?.value ?? "Date unknown" : `${relativeDemoDate(DEMO_APPOINTMENT_DATE)} · ${nextAppointment.date}`} · {facts ? facts.time?.value ?? "Time unknown" : nextAppointment.time}</p>
    <p className="mt-2 text-sm text-care-muted">{facts ? facts.location?.value ?? "Location unknown" : `${nextAppointment.hospital}, ${nextAppointment.location}`}</p>
    {facts?.department && <p className="text-sm text-care-muted">{facts.department.value}</p>}
    {facts && <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold text-care-teal">Source quotations</summary>{Object.entries(facts).filter(([, fact]) => fact).map(([key, fact]) => <blockquote key={key} className="mt-2 border-l-2 border-care-teal pl-3 text-care-muted">{fact!.source_quote}</blockquote>)}</details>}
    {!facts && <p className="mt-3 text-xs text-care-muted">Fictional calendar. Source dates remain unchanged when you confirm a different appointment.</p>}
  </Card>;
}
