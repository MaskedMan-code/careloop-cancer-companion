import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import JourneyTimeline from "@/components/JourneyTimeline";
import { journeySteps } from "@/lib/mockData";

export default function JourneyPage() {
  const completed = journeySteps.filter((s) => s.status === "completed").length;
  const total = journeySteps.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <PageShell>
      <Header
        title="Your Care Journey"
        subtitle="One continuous timeline — nothing repeated, nothing lost."
        backHref="/home"
      />

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-care-muted">
          <span>Journey progress</span>
          <span>
            {completed} of {total} steps completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-care-tint2">
          <div
            className="h-full rounded-full bg-care-green transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <JourneyTimeline steps={journeySteps} />

      <BottomNav />
    </PageShell>
  );
}
