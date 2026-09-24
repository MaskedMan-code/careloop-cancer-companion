import { CheckCircle2, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/Buttons";

const rows = [
  { label: "Hospital visit", status: "Completed" },
  { label: "Caregiver notified", status: "Completed" },
  { label: "Companion session", status: "Completed" },
];

export default function AfterSupportPage() {
  return (
    <PageShell withBottomPadding={false}>
      <Header title="Journey updated" backHref="/companion-session" />

      <Card className="mb-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-b border-care-border py-2.5 last:border-0"
          >
            <span className="text-care-text">{r.label}</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-care-green">
              <CheckCircle2 size={15} /> {r.status}
            </span>
          </div>
        ))}
      </Card>

      <Card tint className="mb-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-care-teal">
          <ArrowRight size={15} /> Next
        </p>
        <p className="mt-1 text-care-text">Follow-up appointment</p>
      </Card>

      <div className="rounded-xl bg-care-dark px-4 py-4 text-center font-serif text-base italic text-white">
        The journey continues — nothing is lost between visits.
      </div>

      <div className="mt-6">
        <PrimaryButton href="/home">Back to home</PrimaryButton>
      </div>
    </PageShell>
  );
}
