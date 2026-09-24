"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, MessageCircle, ShieldCheck } from "lucide-react";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/journey", label: "Journey", icon: MapPinned },
  { href: "/companion", label: "Companion", icon: MessageCircle },
  { href: "/support", label: "Support", icon: ShieldCheck },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-care-border bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-care-teal" : "text-care-muted"}
              />
              <span
                className={
                  active
                    ? "font-semibold text-care-teal"
                    : "text-care-muted"
                }
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
