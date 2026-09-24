"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Square, ShieldCheck, PartyPopper } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/Buttons";
import { useDemo, findCompanion } from "@/lib/DemoContext";

function ConsentContent() {
  const params = useSearchParams();
  const companionId = params.get("companion");
  const companion = findCompanion(companionId);
  const { consent, setConsent, consentGiven, giveConsent, setSelectedCompanionId } =
    useDemo();

  function toggle(key: keyof typeof consent) {
    setConsent({ ...consent, [key]: !consent[key] });
  }

  function handleConsent() {
    if (companionId) setSelectedCompanionId(companionId);
    giveConsent();
  }

  const rows: { key: keyof typeof consent; label: string }[] = [
    { key: "appointmentDetails", label: "Appointment details" },
    { key: "navigationTasks", label: "Navigation tasks" },
    { key: "otherDocuments", label: "Other documents" },
  ];

  return (
    <PageShell withBottomPadding={false}>
      <Header
        title={consentGiven ? "Consent recorded" : "Share your CareLoop journey?"}
        subtitle={
          companion
            ? `With ${companion.name}, ${companion.role.toLowerCase()}`
            : undefined
        }
        backHref={companionId ? undefined : "/human-companion"}
      />

      {!consentGiven ? (
        <>
          <p className="mb-4 text-sm text-care-text">
            This companion will receive only the information you choose to
            share.
          </p>

          <Card className="mb-5">
            <div className="space-y-1">
              {rows.map((r) => (
                <button
                  key={r.key}
                  onClick={() => toggle(r.key)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-care-tint"
                >
                  {consent[r.key] ? (
                    <CheckSquare size={20} className="text-care-green" />
                  ) : (
                    <Square size={20} className="text-care-muted" />
                  )}
                  <span className="text-care-text">{r.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <PrimaryButton icon={<ShieldCheck size={16} />} onClick={handleConsent}>
            Give consent &amp; continue
          </PrimaryButton>

          <p className="mt-4 text-center text-xs text-care-muted">
            You can change what you share at any time.
          </p>
        </>
      ) : (
        <div className="animate-in text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-care-green/15 text-care-green">
            <PartyPopper size={26} />
          </div>
          <p className="mb-1 font-serif text-lg font-bold text-care-text">
            Human companion added to your CareLoop journey.
          </p>
          <p className="mb-6 text-sm text-care-muted">
            Nothing is repeated or lost — {companion?.name ?? "your companion"}{" "}
            now sees exactly what you consented to share.
          </p>
          <PrimaryButton href="/shared-journey">View shared journey</PrimaryButton>
        </div>
      )}
    </PageShell>
  );
}

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentContent />
    </Suspense>
  );
}
