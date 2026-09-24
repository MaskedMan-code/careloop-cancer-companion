import type { TaskStatus } from "@/lib/types";

const styles: Record<TaskStatus, string> = {
  completed: "bg-care-green/15 text-care-green",
  current: "bg-care-teal/15 text-care-teal",
  next: "bg-care-mint/15 text-care-mint",
  pending: "bg-care-muted/15 text-care-muted",
};

const labels: Record<TaskStatus, string> = {
  completed: "Completed",
  current: "Current",
  next: "Next",
  pending: "Pending",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
