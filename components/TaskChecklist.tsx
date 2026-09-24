"use client";

import { CheckSquare, Square } from "lucide-react";
import type { Task } from "@/lib/types";

export default function TaskChecklist({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle?: (id: string) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            onClick={() => onToggle?.(task.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-care-border bg-white px-3.5 py-3 text-left shadow-soft transition hover:border-care-teal/40"
            aria-pressed={task.done}
          >
            {task.done ? (
              <CheckSquare size={20} className="shrink-0 text-care-green" />
            ) : (
              <Square size={20} className="shrink-0 text-care-muted" />
            )}
            <span
              className={
                task.done
                  ? "text-care-muted line-through"
                  : "font-medium text-care-text"
              }
            >
              {task.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
