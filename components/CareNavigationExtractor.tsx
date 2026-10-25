"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Loader2,
  PhoneCall,
  ShieldAlert,
  Trash2,
  WifiOff,
} from "lucide-react";
import { useDemo } from "@/lib/DemoContext";
import { MAX_INPUT_CHARS } from "@/lib/care-navigation/constants";
import type { ApiResponse, ApiSuccess } from "@/lib/care-navigation/schema";
import { FinalResultSchema } from "@/lib/care-navigation/schema";
import { SAMPLE_EN, SAMPLE_HI } from "@/lib/demoCalendar";
import Card from "./Card";
import { PrimaryButton, SecondaryButton } from "./Buttons";

type Proposal = {
  key: string;
  include: boolean;
  label: string;
  category: string;
  origin: "explicit" | "suggestion";
  dueText: string | null;
  sourceQuote: string | null;
  assignedTo: "patient" | "caregiver";
};

type View =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: string; message: string }
  | { kind: "result"; data: ApiSuccess }
  | { kind: "added"; added: number; skipped: number };

const FACT_LABELS: Record<string, string> = {
  title: "Appointment",
  date: "Date",
  time: "Time",
  location: "Location",
  department: "Department",
};

export default function CareNavigationExtractor() {
  const { addConfirmedTasks, confirmAppointment } = useDemo();
  const [text, setText] = useState("");
  const [view, setView] = useState<View>({ kind: "idle" });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [includeAppointment, setIncludeAppointment] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  const tooLong = text.length > MAX_INPUT_CHARS;
  const canSubmit = text.trim().length > 0 && !tooLong && view.kind !== "loading";

  async function extract() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 65_000);
    setView({ kind: "loading" });
    try {
      const res = await fetch("/api/care-navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessCode ? { "X-CareLoop-Access-Code": accessCode } : {}) },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      const data = (await res.json()) as ApiResponse;
      if (!data || typeof data.ok !== "boolean") throw new Error("Invalid server response");
      if (!data.ok) {
        setView({ kind: "error", code: data.error.code, message: data.error.message });
        return;
      }
      if (!res.ok || !FinalResultSchema.safeParse(data.result).success || !["sarvam-live", "safety-guard"].includes(data.source) || !Array.isArray(data.warnings)) throw new Error("Invalid server response");
      setIncludeAppointment(false);
      setProposals(
        data.result.tasks.map((t, i) => ({
          key: `${t.id}-${i}`,
          // Pre-select only tasks stated in the text; suggestions stay opt-in.
          include: t.origin === "explicit",
          label: t.label,
          category: t.category,
          origin: t.origin,
          dueText: t.due_text,
          sourceQuote: t.source_quote,
          assignedTo: "patient",
        }))
      );
      setView({ kind: "result", data });
    } catch {
      setView({
        kind: "error",
        code: "NETWORK",
        message: "CareLoop couldn't reach the server. Check your connection and try again.",
      });
    } finally {
      clearTimeout(timer);
    }
  }

  function confirmSelected() {
    const chosen = proposals.filter((p) => p.include && p.label.trim());
    const { added, skipped } = addConfirmedTasks(
      chosen.map((p) => ({
        label: p.label,
        category: p.category,
        dueText: p.dueText,
        sourceQuote: p.sourceQuote,
        explicit: p.origin === "explicit",
        assignedTo: p.assignedTo,
      }))
    );
    if (includeAppointment && view.kind === "result") confirmAppointment(view.data.result.appointment);
    setView({ kind: "added", added, skipped });
  }

  function reset() {
    setView({ kind: "idle" });
    setProposals([]);
  }

  const selectedCount = proposals.filter((p) => p.include && p.label.trim()).length;

  return (
    <section aria-labelledby="extractor-heading" className="mb-8 rounded-2xl border border-care-border bg-white p-4 shadow-soft sm:p-6">
      <div className="mb-2 flex items-center gap-2 text-care-teal">
        <FileSearch size={18} />
        <h2 id="extractor-heading" className="font-serif text-lg font-bold text-care-text">
          Read my appointment text
        </h2>
      </div>
      <p className="mb-3 text-sm text-care-muted">
        Paste an appointment or instruction message. CareLoop AI lists the administrative steps it
        finds. You review them first &mdash; nothing is added until you confirm.
      </p>

      <div className="mb-3 flex gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        <p>
          Prototype only: use <strong>fictional</strong> text. Your text is sent to
          Sarvam AI to be read. Don&rsquo;t paste real patient names, IDs or reports.
        </p>
      </div>

      {view.kind !== "added" && (
        <>
          <label htmlFor="care-text" className="mb-1 block text-sm font-semibold text-care-text">
            Appointment or instruction text
          </label>
          <textarea
            id="care-text"
            value={text}
            disabled={view.kind === "loading"}
            onChange={(e) => { setText(e.target.value); reset(); }}
            rows={6}
            placeholder="Paste fictional appointment text in English or Hindi…"
            aria-describedby="care-text-count"
            className="w-full rounded-xl border border-care-border bg-white p-3 text-[15px] text-care-text shadow-soft placeholder:text-care-muted/70"
          />
          <div className="mb-3 mt-1 flex items-center justify-between text-xs">
            <span id="care-text-count" className={tooLong ? "font-semibold text-red-700" : "text-care-muted"}>
              {text.length} / {MAX_INPUT_CHARS}
            </span>
            <span className="flex gap-3">
              <button disabled={view.kind === "loading"} type="button" onClick={() => { setText(SAMPLE_EN); reset(); }} className="min-h-11 font-semibold text-care-teal underline">
                Sample (English)
              </button>
              <button disabled={view.kind === "loading"} type="button" onClick={() => { setText(SAMPLE_HI); reset(); }} className="min-h-11 font-semibold text-care-teal underline">
                Sample (Hindi)
              </button>
            </span>
          </div>
          <label htmlFor="judge-code" className="mb-1 block text-sm font-semibold">Judge access code</label>
          <input id="judge-code" type="password" autoComplete="off" maxLength={256} value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="mb-1 min-h-12 w-full rounded-xl border border-care-border bg-white px-3" />
          <p className="mb-3 text-xs text-care-muted">Required for the public demo. Ask the demo organizer for access. Kept only in memory while this screen is open; leave empty for an explicitly enabled local demo.</p>
          <PrimaryButton onClick={extract} disabled={!canSubmit} icon={view.kind === "loading" ? <Loader2 size={16} className="animate-spin" /> : undefined}>
            {view.kind === "loading" ? "Reading your text…" : "Find my tasks"}
          </PrimaryButton>
        </>
      )}

      <div aria-live="polite" className="mt-4">
        {view.kind === "loading" && (
          <p className="animate-pulse-soft text-center text-sm text-care-muted">
            Asking CareLoop AI to read your text…
          </p>
        )}

        {view.kind === "error" && (
          <Card className="border-red-200 bg-red-50 animate-in" >
            <p className="flex items-center gap-2 font-semibold text-red-800">
              <WifiOff size={16} /> AI unavailable
            </p>
            <p className="mt-1 text-sm text-red-900">{view.message}</p>
            <p className="mt-2 text-xs text-red-900/80">Nothing was extracted or added.</p>
          </Card>
        )}

        {view.kind === "result" && (
          <ResultPanel
            data={view.data}
            proposals={proposals}
            setProposals={setProposals}
            selectedCount={selectedCount}
            onConfirm={confirmSelected}
            onReset={reset}
            includeAppointment={includeAppointment}
            setIncludeAppointment={setIncludeAppointment}
          />
        )}

        {view.kind === "added" && (
          <Card tint className="animate-in text-center">
            <CheckCircle2 size={28} className="mx-auto text-care-green" />
            <p className="mt-2 font-serif text-lg font-bold text-care-text">
              {view.added === 0 ? "Nothing new to add" : `${view.added} task${view.added === 1 ? "" : "s"} added to your journey`}
            </p>
            <p className="mt-1 text-sm text-care-muted">
              {view.skipped > 0 ? `${view.skipped} already on your list or empty, skipped. ` : ""}
              None are marked complete.
            </p>
            <div className="mt-4 space-y-2">
              <PrimaryButton href="/whats-next">See in What&rsquo;s next</PrimaryButton>
              <SecondaryButton href="/journey">View journey</SecondaryButton>
              <button type="button" onClick={reset} className="text-sm font-semibold text-care-teal underline">
                Read another text
              </button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

function ResultPanel({
  data,
  proposals,
  setProposals,
  selectedCount,
  onConfirm,
  onReset,
  includeAppointment,
  setIncludeAppointment,
}: {
  data: ApiSuccess;
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  selectedCount: number;
  onConfirm: () => void;
  onReset: () => void;
  includeAppointment: boolean;
  setIncludeAppointment: (value: boolean) => void;
}) {
  const { result, source, model, warnings } = data;
  const urgent = result.clinical.urgent_concern_detected;
  const facts = Object.entries(result.appointment).filter(([, v]) => v) as [string, { value: string; source_quote: string }][];

  const update = (key: string, patch: Partial<Proposal>) =>
    setProposals((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const remove = (key: string) => setProposals((prev) => prev.filter((p) => p.key !== key));

  return (
    <div className="space-y-4 animate-in">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-care-muted">
        {source === "sarvam-live"
          ? `Read by Sarvam AI (live) · ${model}`
          : "Safety check only · no AI was used"}
      </p>

      {urgent && (
        <div role="alert" className="flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-red-900">
          <PhoneCall size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{result.safe_message}</p>
        </div>
      )}

      {!urgent && (
        <Card tint>
          <p className="text-sm text-care-text">{result.summary}</p>
          <p
            className={`mt-2 flex gap-1.5 text-xs ${
              result.clinical.advice_requested || result.clinical.content_detected
                ? "font-medium text-amber-900"
                : "text-care-muted"
            }`}
          >
            {(result.clinical.advice_requested || result.clinical.content_detected) && (
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            )}
            <span>{result.safe_message}</span>
          </p>
        </Card>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-care-border bg-white p-3 text-xs text-care-muted">
          {warnings.map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      )}

      {facts.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Found in your text</p>
          <dl className="space-y-2">
            {facts.map(([field, f]) => (
              <div key={field}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-care-teal">
                  {FACT_LABELS[field] ?? field}
                </dt>
                <dd className="text-sm text-care-text">{f.value}</dd>
                <dd className="text-[11px] italic text-care-muted">&ldquo;{f.source_quote}&rdquo;</dd>
              </div>
            ))}
          </dl>
          <label className="mt-4 flex min-h-12 items-center gap-3 border-t border-care-border pt-3 text-sm"><input type="checkbox" checked={includeAppointment} onChange={(e) => setIncludeAppointment(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#028090]" />Use these source appointment details when I confirm. Missing details remain unknown.</label>
        </Card>
      )}

      {result.missing_or_ambiguous.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-care-text">Not clear or not found</p>
          <ul className="space-y-1 text-sm text-care-muted">
            {result.missing_or_ambiguous.map((m, i) => (
              <li key={`${m.topic}-${i}`}>
                <span className="font-medium text-care-text">{m.topic}:</span> {m.note}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!urgent && (
        <div>
          <p className="mb-1 text-sm font-bold text-care-text">Proposed tasks</p>
          <p className="mb-2 text-xs text-care-muted">
            Edit, remove or untick anything. Only ticked tasks are added, as pending.
          </p>
          {proposals.length === 0 ? (
            <p className="rounded-xl border border-dashed border-care-border p-3 text-sm text-care-muted">
              No administrative tasks were found.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {proposals.map((p) => (
                <li key={p.key} className="rounded-xl border border-care-border bg-white p-3 shadow-soft">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={p.include}
                      onChange={(e) => update(p.key, { include: e.target.checked })}
                      aria-label={`Include task: ${p.label}`}
                      className="mt-2.5 h-5 w-5 shrink-0 accent-[#028090]"
                    />
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={p.label}
                        rows={2}
                        maxLength={140}
                        onChange={(e) => update(p.key, { label: e.target.value.replace(/\n/g, " ") })}
                        aria-label="Task wording"
                        className="w-full resize-none rounded-lg border border-care-border px-2.5 py-2 text-[15px] leading-snug text-care-text"
                      />
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-care-muted">
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold ${
                            p.origin === "explicit" ? "bg-care-green/15 text-care-green" : "bg-care-muted/15 text-care-muted"
                          }`}
                        >
                          {p.origin === "explicit" ? "Stated in your text" : "Optional suggestion"}
                        </span>
                        <span>{p.category.replace("_", " ")}</span>
                        {p.dueText && <span>· {p.dueText}</span>}
                      </p>
                      {p.sourceQuote && (
                        <p className="mt-1 text-[11px] italic text-care-muted">&ldquo;{p.sourceQuote}&rdquo;</p>
                      )}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <label className="text-sm">Due date / source wording<input aria-label={`Due date: ${p.label}`} maxLength={280} value={p.dueText ?? ""} onChange={(e) => update(p.key, { dueText: e.target.value || null })} placeholder="Unknown / optional" className="mt-1 min-h-11 w-full rounded-lg border border-care-border px-2" /></label>
                        <label className="text-sm">Assigned to<select aria-label={`Assign proposal: ${p.label}`} value={p.assignedTo} onChange={(e) => update(p.key, { assignedTo: e.target.value as "patient" | "caregiver" })} className="mt-1 w-full rounded-lg border border-care-border bg-white px-2"><option value="patient">Ayesha</option><option value="caregiver">Sara</option></select></label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(p.key)}
                      aria-label={`Remove task: ${p.label}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-care-muted hover:bg-care-tint hover:text-red-700"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-2">
        {!urgent && (
          <PrimaryButton onClick={onConfirm} disabled={selectedCount === 0 && !includeAppointment}>
            Add {selectedCount} selected task{selectedCount === 1 ? "" : "s"} to my journey
          </PrimaryButton>
        )}
        <SecondaryButton onClick={onReset}>Start over</SecondaryButton>
        <p className="text-center text-xs text-care-muted">
          CareLoop doesn&rsquo;t diagnose or advise on treatment.{" "}
          <Link href="/support" className="font-semibold text-care-teal underline">
            Why?
          </Link>
        </p>
      </div>
    </div>
  );
}
