import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import CompanionCard from "@/components/CompanionCard";
import { companions } from "@/lib/mockData";

export default function EndOfLifeProfilePage() {
  const meera = companions.find((c) => c.id === "meera-rao")!;

  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="End-of-Life Companion"
        subtitle="Appropriately trained for non-clinical end-of-life support."
        backHref="/end-of-life"
      />

      <CompanionCard companion={meera} requestHref={`/consent?companion=${meera.id}`} />

      <p className="mt-4 text-center text-xs font-medium text-care-muted">
        Clinical care remains with the healthcare team.
      </p>
    </PageShell>
  );
}
