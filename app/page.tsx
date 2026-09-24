"use client";

import { useRouter } from "next/navigation";
import { HeartHandshake, User, Users } from "lucide-react";
import { useDemo } from "@/lib/DemoContext";

export default function WelcomePage() {
  const router = useRouter();
  const { setRole } = useDemo();

  function enter(role: "patient" | "caregiver") {
    setRole(role);
    router.push(role === "patient" ? "/home" : "/caregiver");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-care-dark px-6 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-[calc(env(safe-area-inset-top,0px)+3rem)] text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-2 text-care-mint">
          <HeartHandshake size={22} />
          <span className="text-xs font-bold tracking-widest">
            HEALTH-A-THON 2026 PROTOTYPE
          </span>
        </div>

        <h1 className="mt-8 font-serif text-5xl font-bold">CareLoop</h1>
        <p className="mt-3 font-serif text-xl italic text-care-mint">
          &ldquo;Continuous care, beyond the hospital.&rdquo;
        </p>

        <p className="mt-8 max-w-sm text-lg leading-relaxed text-care-tint2">
          Cancer care is a journey. You don&rsquo;t have to navigate it alone.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md space-y-3">
        <button
          onClick={() => enter("patient")}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-[15px] font-semibold text-care-dark shadow-card transition active:scale-[0.98]"
        >
          <User size={18} /> Continue as Patient
        </button>
        <button
          onClick={() => enter("caregiver")}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-[15px] font-semibold text-white backdrop-blur transition active:scale-[0.98]"
        >
          <Users size={18} /> Continue as Caregiver
        </button>

        <p className="pt-3 text-center text-[11px] text-care-tint2/70">
          This is a non-clinical navigation prototype using fictional demo
          data only.
        </p>
        <p className="text-center text-[11px]">
          <a href="/companion-dashboard" className="underline text-care-tint2/70">
            View human companion dashboard (demo)
          </a>
        </p>
      </div>
    </div>
  );
}
