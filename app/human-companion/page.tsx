import { ChevronRight, HeartHandshake } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { companionHumanTypes } from "@/lib/mockData";

const hrefFor = (type: string) =>
  type === "eol" ? "/end-of-life" : `/human-companion/matching?type=${type}`;

export default function HumanCompanionPage() {
  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="Choose the support you need"
        subtitle="Human companions join your same CareLoop journey — nothing is repeated."
        backHref="/whats-next"
      />

      <div className="space-y-3">
        {companionHumanTypes.map((t) => (
          <a key={t.type} href={hrefFor(t.type)}>
            <Card
              className={`flex items-center justify-between gap-3 transition hover:border-care-teal/50 ${
                t.type === "eol" ? "bg-care-tint" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-care-teal/15 text-care-teal">
                  <HeartHandshake size={17} />
                </div>
                <div>
                  <p className="font-semibold text-care-text">{t.title}</p>
                  <p className="text-sm text-care-muted">{t.description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-care-muted" />
            </Card>
          </a>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-care-muted">
        All companions are verified and appropriately trained. None provide
        medical qualifications unless explicitly shown.
      </p>
    </PageShell>
  );
}
