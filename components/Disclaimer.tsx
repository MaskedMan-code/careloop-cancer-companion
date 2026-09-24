import { Info } from "lucide-react";

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-care-border bg-care-tint text-care-muted ${
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs"
      }`}
    >
      <Info size={compact ? 14 : 16} className="mt-0.5 shrink-0 text-care-teal" />
      <p>
        CareLoop provides non-clinical navigation and coordination. Clinical
        decisions remain with your healthcare team.
      </p>
    </div>
  );
}
