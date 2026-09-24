import { ChevronDown } from "lucide-react";
import Link from "next/link";

const flow = [
  "Patient",
  "AI Companion",
  "Human Companion",
  "End-of-Life Companion / Death Doula, when appropriate",
  "Healthcare Team",
];

export default function EndPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-care-dark px-6 py-12 text-center text-white">
      <p className="text-xs font-bold tracking-widest text-care-mint">
        HEALTH-A-THON 2026 PROTOTYPE
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold">CareLoop</h1>
      <p className="mx-auto mt-3 max-w-xs font-serif text-lg italic text-care-tint2">
        AI when you need guidance. A human when you need presence.
      </p>

      <div className="mt-8 flex flex-col items-center gap-2">
        {flow.map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-2">
            <div className="max-w-xs rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur">
              {step}
            </div>
            {i < flow.length - 1 && (
              <ChevronDown size={16} className="text-care-mint" />
            )}
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-xs font-serif text-xl italic text-care-mint">
        Nobody should have to navigate cancer alone.
      </p>

      <Link
        href="/"
        className="mt-10 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur"
      >
        Restart demo
      </Link>
    </div>
  );
}
