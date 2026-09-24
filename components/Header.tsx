"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  const router = useRouter();
  return (
    <div className="mb-5 flex items-start gap-3 animate-in">
      {backHref !== undefined && (
        <button
          aria-label="Go back"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-care-border bg-care-tint text-care-teal transition hover:bg-care-tint2"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div>
        <h1 className="font-serif text-2xl font-bold leading-tight text-care-text">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-care-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
