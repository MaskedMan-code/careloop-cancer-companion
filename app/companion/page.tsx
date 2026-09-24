"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, Sparkles, FileText, CalendarClock, Car, Users, Bell } from "lucide-react";
import PageShell from "@/components/PageShell";
import BottomNav from "@/components/BottomNav";
import Disclaimer from "@/components/Disclaimer";
import { nextAppointment } from "@/lib/mockData";

type Msg = { from: "user" | "ai"; text: string };

const quickInfo = [
  { icon: FileText, label: "Documents" },
  { icon: CalendarClock, label: "Appointment details" },
  { icon: Car, label: "Transport" },
  { icon: Users, label: "Caregiver" },
  { icon: Bell, label: "Reminders" },
];

export default function CompanionPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    { from: "user", text: "I have my appointment tomorrow. What should I do?" },
    {
      from: "ai",
      text: "Your appointment is tomorrow. I can help you organize the non-clinical things you need to prepare.",
    },
  ]);
  const [thinking, setThinking] = useState(false);

  function respond(text: string) {
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "ai", text }]);
      setThinking(false);
    }, 550);
  }

  function handlePrompt(prompt: string) {
    setMessages((m) => [...m, { from: "user", text: prompt }]);
    if (prompt === "What's next?") {
      router.push("/whats-next");
      return;
    }
    if (prompt === "I need someone with me") {
      respond("Of course. Let's find the right kind of human support for you.");
      setTimeout(() => router.push("/human-companion"), 900);
      return;
    }
    if (prompt === "Show my pending tasks") {
      respond("You have two pending items: Imaging, and Follow-up scheduling. Both will be organized once your oncology appointment is complete.");
      return;
    }
    if (prompt === "Notify my caregiver") {
      respond(`Sara has been notified about tomorrow's appointment and the prepared checklist.`);
      return;
    }
  }

  return (
    <PageShell>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-care-dark text-care-mint">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-serif text-lg font-bold text-care-text">
            AI Care Companion
          </p>
          <p className="text-xs text-care-muted">Non-clinical navigation & coordination</p>
        </div>
      </div>

      <div className="mb-4">
        <Disclaimer compact />
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed animate-in ${
                m.from === "user"
                  ? "bg-care-teal text-white"
                  : "border border-care-border bg-care-tint text-care-text"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-care-border bg-care-tint px-4 py-2.5 text-care-muted animate-pulse-soft">
              CareLoop is thinking…
            </div>
          </div>
        )}
      </div>

      <div className="my-4 grid grid-cols-3 gap-2">
        {quickInfo.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-care-border bg-white p-2.5 text-center"
          >
            <Icon size={16} className="text-care-teal" />
            <span className="text-[10.5px] text-care-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["What's next?", "Show my pending tasks", "Notify my caregiver", "I need someone with me"].map(
          (p) => (
            <button
              key={p}
              onClick={() => handlePrompt(p)}
              className="rounded-full border border-care-border bg-white px-3.5 py-2 text-sm font-medium text-care-teal transition hover:bg-care-tint"
            >
              {p}
            </button>
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-care-border bg-white px-4 py-3 text-care-muted">
        <span className="flex-1 text-sm">Message CareLoop…</span>
        <Send size={16} />
      </div>

      <BottomNav />
    </PageShell>
  );
}
