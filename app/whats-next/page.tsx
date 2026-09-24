"use client";

import { ArrowLeft, Sparkles, Users, HelpingHand } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import TaskChecklist from "@/components/TaskChecklist";
import Disclaimer from "@/components/Disclaimer";
import { SecondaryButton } from "@/components/Buttons";
import { useDemo } from "@/lib/DemoContext";
import { nextAppointment } from "@/lib/mockData";
import Link from "next/link";

export default function WhatsNextPage() {
  const { tasks, toggleTask, notifyCaregiver, caregiverNotified } = useDemo();
  const allDone = tasks.every((t) => t.done);

  return (
    <PageShell>
      <Link
        href="/home"
        aria-label="Go back"
        className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-care-border bg-care-tint text-care-teal"
      >
        <ArrowLeft size={18} />
      </Link>
      <div className="mb-2 flex items-center gap-2 text-care-teal">
        <Sparkles size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">
          AI Care Companion
        </span>
      </div>
      <h1 className="mb-4 font-serif text-3xl font-bold text-care-text">
        What&rsquo;s next?
      </h1>

      <div className="mb-5 rounded-2xl border border-care-border bg-care-tint p-4 text-[15px] leading-relaxed text-care-text animate-in">
        Your {nextAppointment.title.toLowerCase()} is tomorrow. Here are the
        non-clinical steps you can prepare today.
      </div>

      <TaskChecklist tasks={tasks} onToggle={toggleTask} />

      {allDone && (
        <p className="mt-3 text-sm font-medium text-care-green animate-in">
          All set for tomorrow — nicely done.
        </p>
      )}

      <div className="mt-5 space-y-2">
        <SecondaryButton
          icon={<Users size={16} />}
          onClick={notifyCaregiver}
          href="/caregiver"
        >
          {caregiverNotified ? "Shared with caregiver ✓" : "Share with caregiver"}
        </SecondaryButton>
        <SecondaryButton icon={<HelpingHand size={16} />} href="/human-companion">
          Need someone to help
        </SecondaryButton>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>

      <BottomNav />
    </PageShell>
  );
}
