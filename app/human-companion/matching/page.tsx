"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import CompanionCard from "@/components/CompanionCard";
import { companionHumanTypes, companions } from "@/lib/mockData";
import type { CompanionType } from "@/lib/types";

function MatchingContent() {
  const params = useSearchParams();
  const type = (params.get("type") as CompanionType | null) ?? "hospital";
  const meta = companionHumanTypes.find((t) => t.type === type);
  const list = companions.filter((c) => c.type === type);

  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="Available companions"
        subtitle={meta ? meta.title : "Human companion"}
        backHref="/human-companion"
      />

      <div className="space-y-4">
        {list.map((c) => (
          <CompanionCard
            key={c.id}
            companion={c}
            requestHref={`/consent?companion=${c.id}`}
          />
        ))}
        {list.length === 0 && (
          <p className="text-sm text-care-muted">
            No companions found for this category in the demo data.
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-care-muted">
        Patient consent is required before any journey information is shared.
      </p>
    </PageShell>
  );
}

export default function MatchingPage() {
  return (
    <Suspense>
      <MatchingContent />
    </Suspense>
  );
}
