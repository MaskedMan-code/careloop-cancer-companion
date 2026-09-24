"use client";

import { CheckCircle2, Circle } from "lucide-react";
import PageShell from "@/components/PageShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/Buttons";
import { useDemo } from "@/lib/DemoContext";
import { nextAppointment, patient } from "@/lib/mockData";

const steps = [
  "Arrived at hospital",
  "Registration assistance",
  "Waiting for appointment",
  "Return-home support",
];

export default function CompanionSessionPage() {
  const { companionSessionStep, advanceCompanionSession } = useDemo();
  const finished = companionSessionStep >= steps.length;

  return (
    <PageShell withBottomPadding={false}>
      <Header
        title="Companion session"
        subtitle={`${patient.name.split(" ")[0]}'s ${nextAppointment.title.toLowerCase()}`}
        backHref="/shared-journey"
      />

      <Card className="mb-5">
        <ul className="space-y-3">
          {steps.map((s, i) => {
            const done = i < companionSessionStep;
            const active = i === companionSessionStep;
            return (
              <li key={s} className="flex items-center gap-3">
                {done ? (
                  <CheckCircle2 size={20} className="text-care-green" />
                ) : (
                  <Circle
                    size={20}
                    className={active ? "text-care-teal" : "text-care-muted"}
                  />
                )}
                <span
                  className={
                    done
                      ? "text-care-text line-through"
                      : active
                      ? "font-semibold text-care-text"
                      : "text-care-muted"
                  }
                >
                  {s}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {!finished ? (
        <PrimaryButton onClick={advanceCompanionSession}>
          Mark next step complete
        </PrimaryButton>
      ) : (
        <PrimaryButton href="/after-support">Complete session</PrimaryButton>
      )}

      <p className="mt-4 text-center text-xs text-care-muted">
        Companion tasks are administrative and practical only — no clinical
        information is recorded here.
      </p>
    </PageShell>
  );
}
