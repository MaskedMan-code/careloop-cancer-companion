"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, FileText } from "lucide-react";
import type { JourneyStep } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const dotColor: Record<JourneyStep["status"], string> = {
  completed: "text-care-green",
  current: "text-care-teal",
  next: "text-care-mint",
  pending: "text-care-muted",
};

export default function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const [openId, setOpenId] = useState<string | null>(
    steps.find((s) => s.status === "current")?.id ?? null
  );

  return (
    <ol className="relative ml-3 border-l-2 border-care-border pl-6">
      {steps.map((step, idx) => {
        const isOpen = openId === step.id;
        const Icon =
          step.status === "completed"
            ? CheckCircle2
            : step.status === "current"
            ? Circle
            : Circle;
        return (
          <li key={step.id} className="mb-6 last:mb-0">
            <span
              className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-white ${dotColor[step.status]}`}
            >
              <Icon
                size={18}
                strokeWidth={2.2}
                fill={step.status === "current" ? "currentColor" : "none"}
              />
            </span>
            <button
              onClick={() => setOpenId(isOpen ? null : step.id)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={isOpen}
            >
              <div>
                <p className="font-semibold text-care-text">{step.label}</p>
                <div className="mt-1">
                  <StatusBadge status={step.status} />
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`shrink-0 text-care-muted transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="mt-3 animate-in rounded-xl border border-care-border bg-care-tint p-3 text-sm text-care-text">
                {step.date && (
                  <p>
                    <span className="font-semibold">Date:</span> {step.date}
                  </p>
                )}
                {step.location && (
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {step.location}
                  </p>
                )}
                {step.detail && <p className="mt-1">{step.detail}</p>}
                {step.documents && step.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold">Documents to prepare:</p>
                    {step.documents.map((d) => (
                      <p key={d} className="flex items-center gap-1.5 text-care-muted">
                        <FileText size={14} /> {d}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
