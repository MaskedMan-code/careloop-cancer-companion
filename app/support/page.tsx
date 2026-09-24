import { Bot, Stethoscope, HeartHandshake } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Card from "@/components/Card";

const groups = [
  {
    title: "CareLoop AI helps with",
    icon: Bot,
    color: "bg-care-green",
    items: ["Organization", "Navigation", "Communication", "Reminders", "Coordination", "Human support"],
  },
  {
    title: "Healthcare professionals handle",
    icon: Stethoscope,
    color: "bg-care-dark",
    items: ["Diagnosis", "Treatment", "Clinical decisions"],
  },
  {
    title: "Human companions provide",
    icon: HeartHandshake,
    color: "bg-care-teal",
    items: ["Presence", "Practical support", "Non-clinical companionship"],
  },
];

export default function SupportPage() {
  return (
    <PageShell>
      <Header
        title="Support & Safety"
        subtitle="How CareLoop, healthcare professionals and human companions each contribute."
      />

      <div className="space-y-4">
        {groups.map((g) => (
          <Card key={g.title}>
            <div className="mb-2 flex items-center gap-2.5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${g.color}`}>
                <g.icon size={16} />
              </span>
              <p className="font-semibold text-care-text">{g.title}</p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((i) => (
                <li
                  key={i}
                  className="rounded-full bg-care-tint px-3 py-1.5 text-sm text-care-text"
                >
                  {i}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <details className="mt-6 rounded-xl border border-care-border bg-white p-3 text-xs text-care-muted">
        <summary className="cursor-pointer select-none font-semibold text-care-text">
          About the model
        </summary>
        <p className="mt-2">
          CareLoop is an assistive, non-clinical workflow product. It does not
          diagnose, recommend treatment or interpret medical results.
          End-of-life companionship is modeled on published, non-clinical
          doula roles — companionship, practical and psychosocial support, and
          resource navigation — which complement, and do not replace,
          clinical or palliative care.
        </p>
      </details>

      <p className="mt-4 text-center text-xs">
        <a href="/end" className="font-medium text-care-teal underline">
          View demo summary →
        </a>
      </p>

      <BottomNav />
    </PageShell>
  );
}
