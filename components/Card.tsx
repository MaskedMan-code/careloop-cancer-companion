import React from "react";

export default function Card({
  children,
  className = "",
  tint = false,
}: {
  children: React.ReactNode;
  className?: string;
  tint?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-care-border ${
        tint ? "bg-care-tint" : "bg-white"
      } p-4 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
