"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/lib/DemoContext";
import { DEMO_TODAY, formatDemoDate } from "@/lib/demoCalendar";

export default function DemoBar() {
  const { ready, role, setRole, storageAvailable, resetDemo } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const displayedRole = pathname === "/caregiver" ? "caregiver" : pathname === "/companion-dashboard" ? "companion" : pathname === "/home" ? "patient" : role ?? "patient";
  return <aside aria-label="Demo controls" className="mb-7 rounded-2xl border border-care-border bg-care-tint p-4 text-xs text-care-muted print:hidden">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/home" className="font-serif text-xl font-bold text-care-dark">CareLoop</Link>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">Demo view
          <select aria-label="Demo view" disabled={!ready} value={displayedRole} onChange={(e) => { const value = e.target.value as "patient" | "caregiver" | "companion"; setRole(value); router.push(value === "patient" ? "/home" : value === "caregiver" ? "/caregiver" : "/companion-dashboard"); }} className="rounded-lg border border-care-border bg-white px-2 py-2 text-sm text-care-text">
            <option value="patient">Patient</option><option value="caregiver">Caregiver</option><option value="companion">Companion</option>
          </select>
        </label>
        <button disabled={!ready} onClick={() => { resetDemo(); router.push("/home"); }} className="min-h-11 font-semibold text-care-teal underline">Reset Demo</button>
      </div>
    </div>
    <p className="mt-2">Fictional demo · today is {formatDemoDate(DEMO_TODAY)}. Switching views is not identity verification.</p>
    <p className="mt-1" role="status">{!ready ? "Restoring demo progress…" : storageAvailable ? "Saved only in this browser. Use fictional information only." : "Browser storage is unavailable. Progress will be lost on refresh."}</p>
  </aside>;
}
