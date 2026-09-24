"use client";

import Link from "next/link";
import React from "react";

type CommonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const base =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 min-h-[48px]";

export function PrimaryButton({
  children,
  href,
  onClick,
  icon,
  className = "",
  type = "button",
  disabled,
}: CommonProps) {
  const cls = `${base} bg-care-teal text-white shadow-card hover:bg-care-dark2 ${className}`;
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {icon}
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
  onClick,
  icon,
  className = "",
  type = "button",
  disabled,
}: CommonProps) {
  const cls = `${base} border border-care-border bg-white text-care-text hover:border-care-teal/50 hover:bg-care-tint ${className}`;
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {icon}
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  icon,
  className = "",
}: CommonProps) {
  const cls = `${base} bg-transparent text-care-teal hover:bg-care-tint ${className}`;
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {icon}
        {children}
      </Link>
    );
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {children}
    </button>
  );
}
