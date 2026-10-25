"use client";

import Link from "next/link";
import { useDemo } from "@/lib/DemoContext";
import TaskChecklist from "./TaskChecklist";

/** Journey section listing tasks the patient confirmed from the AI extractor (renders nothing if none). */
export default function AddedTasks() {
  const { tasks, toggleTask } = useDemo();
  const added = tasks.filter((t) => t.confirmationStatus === "confirmed");

  return (
    <section aria-labelledby="added-tasks-heading" className="mt-8 animate-in">
      <h2 id="added-tasks-heading" className="mb-1 font-serif text-lg font-bold text-care-text">
        Confirmed preparation tasks
      </h2>
      <p className="mb-3 text-xs text-care-muted">
        Administrative tasks are separate from care milestones. Completion also updates What&rsquo;s next and any shared caregiver view.
      </p>
      <TaskChecklist tasks={added} onToggle={toggleTask} />
      <Link href="/whats-next" className="mt-3 inline-block text-sm font-semibold text-care-teal underline">
        Open What&rsquo;s next →
      </Link>
    </section>
  );
}
