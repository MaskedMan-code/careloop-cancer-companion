import { ChevronDown, HeartHandshake, Sparkles, User, Users } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/Buttons";
import { journeyEventsShared } from "@/lib/mockData";

const nodes = [
  { label: "Patient", icon: User, color: "bg-care-dark" },
  { label: "AI Companion", icon: Sparkles, color: "bg-care-green" },
  { label: "Human Companion", icon: HeartHandshake, color: "bg-care-mint" },
  { label: "Caregiver", icon: Users, color: "bg-care-teal" },
];

export default function SharedJourneyPage() {
  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="One shared journey"
        subtitle="Everyone sees the same journey, with consent."
        backHref="/consent"
      />

      <div className="mb-3 grid grid-cols-4 gap-2">
        {nodes.map(({ label, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
            <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${color}`}>
              <Icon size={18} />
            </span>
            <span className="text-[10.5px] font-medium text-care-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 flex justify-center">
        <ChevronDown size={18} className="text-care-muted" />
      </div>

      <div className="mb-5 rounded-xl bg-care-teal py-3 text-center font-serif text-base font-bold text-white">
        CareLoop Journey
      </div>

      <Card className="mb-5">
        <p className="mb-3 text-sm font-bold text-care-text">Latest updates</p>
        <ul className="space-y-3">
          {journeyEventsShared.map((e) => (
            <li key={e.id} className="flex items-center justify-between text-sm">
              <span className="text-care-text">{e.label}</span>
              <span className="text-xs text-care-muted">{e.timestamp}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-xl bg-care-dark px-4 py-4 text-center font-serif text-lg italic text-white">
        Nothing is repeated or lost.
      </div>

      <div className="mt-5">
        <PrimaryButton href="/companion-session">Open companion session</PrimaryButton>
      </div>
    </PageShell>
  );
}
