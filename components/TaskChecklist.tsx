"use client";

import { CheckSquare, Square } from "lucide-react";
import type { Task } from "@/lib/types";

export default function TaskChecklist({
  tasks,
  onToggle,
  onAssign,
  onShare,
}: {
  tasks: Task[];
  onToggle?: (id: string) => void;
  onAssign?: (id: string, person: "patient" | "caregiver") => void;
  onShare?: (id: string, shared: boolean) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {tasks.map((task) => (
        <li key={task.id} className="rounded-xl border border-care-border bg-white p-3 shadow-soft" data-task-id={task.id}>
          <button
            onClick={() => onToggle?.(task.id)}
            aria-label={task.label}
            disabled={!onToggle}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition hover:bg-care-tint"
            aria-pressed={task.done}
          >
            {task.done ? (
              <CheckSquare size={20} className="shrink-0 text-care-green" />
            ) : (
              <Square size={20} className="shrink-0 text-care-muted" />
            )}
            <span className="min-w-0">
              <span
                className={
                  task.done
                    ? "text-care-muted line-through"
                    : "font-medium text-care-text"
                }
              >
                {task.label}
              </span>
              {task.origin === "ai-extracted" && (
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-care-muted">
                  <span className="rounded-full bg-care-tint2 px-2 py-0.5 font-semibold text-care-teal">
                    {task.explicit ? "From your document" : "Suggestion you added"}
                  </span>
                  {task.dueText && <span>{task.dueText}</span>}
                </span>
              )}
            </span>
          </button>
          <p className="mt-1 text-sm text-care-muted">{task.done ? "Completed" : "Pending"} · {task.assignedTo === "caregiver" ? "Sara (caregiver)" : "Ayesha (patient)"}{task.source === "seed" ? " · Example task" : " · Confirmed"}{task.dueText && task.source !== "ai" ? ` · Due: ${task.dueText}` : ""}</p>
          {task.sourceQuote && <details className="mt-2 text-sm text-care-muted"><summary className="cursor-pointer text-care-teal">Original source</summary><blockquote className="mt-1 border-l-2 border-care-border pl-3">{task.sourceQuote}</blockquote></details>}
          {(onAssign || onShare) && <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-care-border pt-3 text-sm">
            {onAssign && <label className="flex items-center gap-2">Assigned to<select aria-label={`Assign task: ${task.label}`} value={task.assignedTo} onChange={(e) => onAssign(task.id, e.target.value as "patient" | "caregiver")} className="rounded-lg border border-care-border bg-white px-2"><option value="patient">Ayesha</option><option value="caregiver">Sara</option></select></label>}
            {onShare && <label className="flex min-h-11 items-center gap-2"><input className="h-5 w-5 accent-[#028090]" type="checkbox" aria-label={`Share task: ${task.label}`} checked={task.sharedWithCaregiver} onChange={(e) => onShare(task.id, e.target.checked)} />Include in caregiver sharing</label>}
          </div>}
        </li>
      ))}
    </ul>
  );
}
