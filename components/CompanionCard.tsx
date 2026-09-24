import { BadgeCheck, GraduationCap, Languages, Clock } from "lucide-react";
import type { Companion } from "@/lib/types";
import Card from "./Card";
import { PrimaryButton } from "./Buttons";

export default function CompanionCard({
  companion,
  requestHref,
}: {
  companion: Companion;
  requestHref: string;
}) {
  return (
    <Card className="animate-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-care-dark text-base font-bold text-white">
          {companion.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="font-semibold text-care-text">{companion.name}</p>
          <p className="text-sm text-care-muted">{companion.role}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {companion.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-care-green/15 px-2.5 py-1 text-[11px] font-semibold text-care-green">
            <BadgeCheck size={13} /> Verified
          </span>
        )}
        {companion.trained && (
          <span className="inline-flex items-center gap-1 rounded-full bg-care-teal/15 px-2.5 py-1 text-[11px] font-semibold text-care-teal">
            <GraduationCap size={13} /> Trained
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-care-text">
        <p className="flex items-center gap-2">
          <Clock size={14} className="text-care-muted" /> Available:{" "}
          {companion.availability}
        </p>
        <p className="flex items-center gap-2">
          <Languages size={14} className="text-care-muted" />{" "}
          {companion.languages.join(", ")}
        </p>
        <p className="text-care-muted">{companion.experience}</p>
      </div>

      {companion.services && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {companion.services.map((s) => (
            <li
              key={s}
              className="rounded-full bg-care-tint2 px-2.5 py-1 text-[11px] font-medium text-care-text"
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <PrimaryButton href={requestHref}>Request companion</PrimaryButton>
      </div>
    </Card>
  );
}
