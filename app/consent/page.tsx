"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { useDemo, findCompanion } from "@/lib/DemoContext";

function ConsentContent() {
  const params = useSearchParams();
  const companionId = params.get("companion");
  const demo = useDemo();
  const caregiver = params.get("target") === "caregiver";
  const companion = findCompanion(companionId ?? demo.selectedCompanionId);
  const granted = caregiver ? demo.caregiverSharing.granted : demo.consentGiven && demo.selectedCompanionId === companion?.id;
  const scope = caregiver ? demo.caregiverSharing : demo.consent;
  const toggle = (key: "appointmentDetails" | "navigationTasks") => caregiver ? demo.setCaregiverSharing({ [key]: !scope[key] }) : demo.setConsent({ ...demo.consent, [key]: !scope[key] });
  function grant() {
    if (caregiver) demo.setCaregiverSharing({ granted: true });
    else if (companion) { demo.setSelectedCompanionId(companion.id); demo.giveConsent(); }
  }
  return <PageShell withBottomPadding={false}>
    <Header title="Share your CareLoop journey?" subtitle={caregiver ? "With Sara · fictional caregiver" : companion ? `With ${companion.name} · fictional companion` : "Choose a fictional companion first"} backHref={caregiver ? "/whats-next" : "/human-companion"} />
    <Card tint className="mb-5"><p className="font-semibold">You choose what appears</p><p className="mt-2 text-sm text-care-muted">Demo consent only, stored in this browser. Switching views does not verify identity. This prototype cannot enforce real privacy or send information to another person.</p></Card>
    <p role="status" className="mb-4 font-semibold text-care-teal">{granted ? "Consent recorded · demo sharing active" : "Sharing is off"}</p>
    <Card className="mb-5"><fieldset><legend className="mb-2 font-semibold">Sharing scope</legend>
      {([['appointmentDetails', 'Appointment details'], ['navigationTasks', 'Selected preparation tasks']] as const).map(([key, label]) => <label key={key} className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={scope[key]} onChange={() => toggle(key)} className="h-5 w-5 accent-[#028090]" />{label}</label>)}
      {!caregiver && <label className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={demo.consent.otherDocuments} onChange={() => demo.setConsent({ ...demo.consent, otherDocuments: !demo.consent.otherDocuments })} className="h-5 w-5 accent-[#028090]" />Other fictional documents (scope preview only)</label>}
    </fieldset></Card>
    <fieldset className="mb-5 rounded-xl border border-care-border bg-white p-4"><legend className="px-1 font-semibold">Select individual tasks</legend><p className="mb-2 text-sm text-care-muted">Newly confirmed tasks stay private until selected. Selected tasks include their due wording and source quotations, even if appointment details are off. The same selection is used for your support team preview.</p>
      {demo.tasks.map((task) => <label key={task.id} className="flex min-h-12 items-center gap-3 border-b border-care-border py-2 last:border-0"><input aria-label={`Share task: ${task.label}`} type="checkbox" checked={task.sharedWithCaregiver} onChange={(e) => demo.updateTask(task.id, { sharedWithCaregiver: e.target.checked })} className="h-5 w-5 shrink-0 accent-[#028090]" /><span>{task.label}</span></label>)}
    </fieldset>
    <div className="space-y-3">
      {!granted && <PrimaryButton disabled={!caregiver && !companion} onClick={grant}>Give consent &amp; continue</PrimaryButton>}
      {granted && <><PrimaryButton href={caregiver ? "/caregiver" : "/shared-journey"}>{caregiver ? "View caregiver checklist" : "View shared journey"}</PrimaryButton><SecondaryButton onClick={caregiver ? demo.revokeCaregiver : demo.revokeCompanion}>Revoke sharing</SecondaryButton></>}
      <SecondaryButton href="/whats-next">Back to preparation plan</SecondaryButton>
    </div>
    <p className="mt-4 text-sm text-care-muted">Scope changes and revocation take effect immediately in this demo. Caregiver and companion grants are separate.</p>
  </PageShell>;
}
export default function ConsentPage() { return <Suspense fallback={<p className="p-6">Loading sharing choices…</p>}><ConsentContent /></Suspense>; }
