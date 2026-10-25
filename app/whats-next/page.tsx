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
import { useState } from "react";
import AppointmentCard from "@/components/AppointmentCard";

export default function WhatsNextPage() {
  const { tasks, toggleTask, updateTask, addConfirmedTasks } = useDemo();
  const [manualTitle, setManualTitle] = useState("");
  const [feedback, setFeedback] = useState("");
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
          Your preparation plan
        </span>
      </div>
      <h1 className="mb-4 font-serif text-3xl font-bold text-care-text">
        What&rsquo;s next?
      </h1>

      <AppointmentCard />
      <p className="mb-4 text-care-muted">{tasks.filter((t) => !t.done).length} pending · {tasks.filter((t) => t.done).length} completed. Review responsibilities and choose which tasks to share.</p>

      <TaskChecklist tasks={tasks} onToggle={toggleTask} onAssign={(id, assignedTo) => updateTask(id, { assignedTo })} onShare={(id, sharedWithCaregiver) => updateTask(id, { sharedWithCaregiver })} />

      {allDone && (
        <p className="mt-3 text-sm font-medium text-care-green animate-in">
          Your preparation checklist is complete.
        </p>
      )}

      <p className="mt-4 text-sm">
        <Link href="/documents" className="font-semibold text-care-teal underline">
          Have an appointment message? Add it to find more tasks →
        </Link>
      </p>
      <form className="mt-5 rounded-xl border border-care-border bg-white p-4" onSubmit={(event) => { event.preventDefault(); const result = addConfirmedTasks([{ label: manualTitle, category: "other", source: "manual", dueText: null, sourceQuote: null, explicit: false }]); setFeedback(result.added ? "Manual task added." : "This task is already on your list, or the list is full."); setManualTitle(""); }}>
        <label htmlFor="manual-task" className="block text-sm font-semibold">Add your own administrative task</label>
        <div className="mt-2 flex flex-wrap gap-2"><input id="manual-task" required maxLength={140} value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-lg border border-care-border px-3" /><button disabled={!manualTitle.trim()} className="rounded-lg bg-care-teal px-4 py-3 font-semibold text-white">Add task</button></div>
        <p role="status" className="mt-2 text-sm text-care-teal">{feedback}</p>
      </form>

      <div className="mt-5 space-y-2">
        <SecondaryButton
          icon={<Users size={16} />}
          href="/consent?target=caregiver"
        >
          Share with caregiver
        </SecondaryButton>
        <SecondaryButton icon={<HelpingHand size={16} />} href="/human-companion">
          Need someone to help
        </SecondaryButton>
        <SecondaryButton onClick={() => window.print()}>Print / save preparation plan</SecondaryButton>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>

      <BottomNav />
    </PageShell>
  );
}
