"use client";

import { useState } from "react";
import { FilePlus2, FileCheck2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { documentTypes, documents as seedDocuments } from "@/lib/mockData";
import type { DocumentItem } from "@/lib/types";

const mockDetailsByType: Record<string, Omit<DocumentItem, "id" | "type">> = {
  "Appointment slip": {
    title: "Oncology appointment",
    date: "24 Sept",
    location: "Oncology OPD",
    action: "Attend appointment",
    preparation: "Carry requested documents",
  },
  "Hospital instruction": {
    title: "Pre-visit instruction",
    date: "24 Sept",
    location: "Sunrise Cancer Institute",
    action: "Follow preparation steps before your visit",
    preparation: "Arrive 30 minutes early with your ID",
  },
  "Referral document": {
    title: "Specialist referral",
    date: "24 Sept",
    location: "Oncology Department",
    action: "Share with the referred department",
    preparation: "Carry the original referral copy",
  },
  "Discharge instruction": {
    title: "Discharge follow-up",
    date: "24 Sept",
    location: "Sunrise Cancer Institute",
    action: "Schedule the recommended follow-up",
    preparation: "Carry discharge summary to next visit",
  },
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>(seedDocuments);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  function addDoc(type: string) {
    const details = mockDetailsByType[type];
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      type,
      ...details,
    };
    setDocs((d) => [newDoc, ...d]);
    setJustAdded(newDoc.id);
    setTimeout(() => setJustAdded(null), 2500);
  }

  return (
    <PageShell>
      <Header
        title="Documents & Instructions"
        subtitle="Add a document or instruction — CareLoop organizes it for you."
        backHref="/home"
      />

      <div className="mb-6 grid grid-cols-2 gap-2.5">
        {documentTypes.map((type) => (
          <button
            key={type}
            onClick={() => addDoc(type)}
            className="flex min-h-[76px] flex-col items-start justify-between rounded-xl border border-dashed border-care-border bg-care-tint p-3 text-left transition hover:border-care-teal/50"
          >
            <FilePlus2 size={18} className="text-care-teal" />
            <span className="text-sm font-medium text-care-text">{type}</span>
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm font-bold text-care-text">
        Organized into your journey
      </p>
      <div className="space-y-3">
        {docs.map((doc) => (
          <Card key={doc.id} className={doc.id === justAdded ? "animate-in ring-1 ring-care-green/40" : ""}>
            {doc.id === justAdded && (
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-care-green">
                <FileCheck2 size={14} /> CareLoop organized this into your journey.
              </p>
            )}
            <p className="text-[11px] font-bold uppercase tracking-wide text-care-teal">
              {doc.type}
            </p>
            <p className="mt-1 font-semibold text-care-text">{doc.title}</p>
            <div className="mt-1.5 space-y-0.5 text-sm text-care-muted">
              <p>Date: {doc.date}</p>
              {doc.location && <p>Location: {doc.location}</p>}
              <p>Action: {doc.action}</p>
              <p>Preparation: {doc.preparation}</p>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-care-muted">
        CareLoop organizes administrative details only — it does not interpret
        medical findings.
      </p>

      <BottomNav />
    </PageShell>
  );
}
