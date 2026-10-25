import {
  MAX_LABEL_CHARS,
  MAX_QUOTE_CHARS,
  MAX_SUGGESTIONS,
  MAX_TASKS,
} from "./constants";
import { CareNavError } from "./errors";
import {
  FinalResult,
  FinalResultSchema,
  type Fact,
  type FinalTask,
  type WireOutput,
} from "./schema";
import {
  MESSAGES,
  containsClinicalClaim,
  detectClinicalAdviceRequest,
  detectClinicalContent,
  detectClinicalFinding,
  detectInjection,
  looksLikeClinicalInstruction,
  normalizeForMatch,
  scriptLanguage,
} from "./safety";

const stripQuoteDecor = (s: string) =>
  s
    .replace(/^[\s"'“”‘’`]+|[\s"'“”‘’`]+$/g, "")
    .replace(/^(\.\.\.|…)+|(\.\.\.|…)+$/g, "")
    .trim();

/** True only if the quote is a real, contiguous substring of the source. */
export function quoteInSource(quote: string, normSource: string): boolean {
  if (!quote || quote.length > MAX_QUOTE_CHARS * 2) return false;
  const nq = normalizeForMatch(stripQuoteDecor(quote));
  return nq.length >= 2 && normSource.includes(nq);
}

/** Every digit run in `value` must also appear in the supporting quote. */
function numbersSupported(value: string, quote: string): boolean {
  const runs = value.match(/\d+/g) ?? [];
  const nq = normalizeForMatch(quote);
  return runs.every((r) => nq.includes(r));
}

export interface PostprocessResult {
  result: FinalResult;
  warnings: string[];
}

export function postprocess(wire: WireOutput, sourceText: string): PostprocessResult {
  const warnings: string[] = [];
  const normSource = normalizeForMatch(sourceText);

  const sourceInjection = detectInjection(sourceText);
  const advice = wire.clinical_advice_requested || detectClinicalAdviceRequest(sourceText);
  const content = wire.clinical_content_detected || detectClinicalContent(sourceText);

  let droppedUngrounded = 0;
  let droppedClinical = 0;
  let droppedInjected = 0;

  // ---- appointment facts ---------------------------------------------------
  const appointment: Record<"title" | "date" | "time" | "location" | "department", Fact | null> = {
    title: null, date: null, time: null, location: null, department: null,
  };
  for (const f of wire.appointment_facts) {
    const value = f.value.trim();
    const quote = stripQuoteDecor(f.source_quote);
    if (!value || value.length > MAX_LABEL_CHARS) { droppedUngrounded++; continue; }
    if (detectInjection(value) || detectInjection(quote)) { droppedInjected++; continue; }
    if (looksLikeClinicalInstruction(value) || detectClinicalFinding(value) || detectClinicalFinding(quote)) { droppedClinical++; continue; }
    if (!quoteInSource(quote, normSource) || !numbersSupported(value, quote)) {
      droppedUngrounded++;
      continue;
    }
    if (appointment[f.field] === null) appointment[f.field] = { value, source_quote: quote };
  }

  // ---- tasks ---------------------------------------------------------------
  const tasks: FinalTask[] = [];
  const seen = new Set<string>();
  let suggestions = 0;
  for (const t of wire.tasks) {
    if (tasks.length >= MAX_TASKS) break;
    const label = t.label.trim();
    const quote = stripQuoteDecor(t.source_quote);
    if (!label || label.length > MAX_LABEL_CHARS) { droppedUngrounded++; continue; }
    if (detectInjection(label) || detectInjection(quote)) { droppedInjected++; continue; }
    if (
      looksLikeClinicalInstruction(label) || looksLikeClinicalInstruction(quote) ||
      detectClinicalFinding(label) || detectClinicalFinding(quote)
    ) {
      droppedClinical++;
      continue;
    }
    const key = normalizeForMatch(label);
    if (seen.has(key)) continue;

    let sourceQuote: string | null = null;
    let dueText: string | null = null;
    if (t.origin === "explicit") {
      if (!quoteInSource(quote, normSource)) { droppedUngrounded++; continue; }
      sourceQuote = quote;
      const due = stripQuoteDecor(t.due_text);
      if (due && quoteInSource(due, normSource)) dueText = due;
    } else {
      // Suggestions are generic helpers: no specifics, no quotation, capped.
      if (/\d/.test(label) || suggestions >= MAX_SUGGESTIONS) { droppedUngrounded++; continue; }
      suggestions++;
    }
    seen.add(key);
    tasks.push({
      id: `t${tasks.length + 1}`,
      label,
      category: t.category,
      origin: t.origin,
      due_text: dueText,
      source_quote: sourceQuote,
    });
  }

  // ---- missing / ambiguous -------------------------------------------------
  const missing: { topic: string; note: string }[] = [];
  for (const m of wire.missing_or_ambiguous) {
    const topic = m.topic.trim();
    const note = m.note.trim();
    if (!topic || !note) continue;
    if (containsClinicalClaim(`${topic} ${note}`) || detectInjection(`${topic} ${note}`)) continue;
    missing.push({ topic, note });
  }
  const hasAppointmentEvidence =
    Object.values(appointment).some(Boolean) || tasks.some((t) => t.category === "appointment");
  if (hasAppointmentEvidence) {
    const has = (word: string) => missing.some((m) => normalizeForMatch(m.topic).includes(word));
    if (!appointment.date && !has("date")) missing.push({ topic: "Appointment date", note: "No date was found in the text." });
    if (!appointment.time && !has("time")) missing.push({ topic: "Appointment time", note: "No time was found in the text." });
    if (!appointment.location && !has("location") && !has("place"))
      missing.push({ topic: "Appointment location", note: "No location was found in the text." });
  }
  if (tasks.length === 0 && !hasAppointmentEvidence) {
    missing.push({ topic: "Tasks", note: "No administrative steps were found in the text." });
  }

  // ---- language ------------------------------------------------------------
  let language = wire.language_detected;
  const script = scriptLanguage(sourceText);
  if ((script === "hindi" || script === "mixed") && language !== script) language = script;

  // ---- summary + safe message (never trust model prose blindly) ------------
  let summary = wire.summary.trim();
  if (!summary || containsClinicalClaim(summary) || detectInjection(summary)) {
    summary = MESSAGES.fallbackSummary;
  }
  summary = summary.slice(0, 600);

  let safe: string = MESSAGES.default;
  if (advice) safe = MESSAGES.advice;
  else if (content) safe = MESSAGES.clinicalContent;
  else {
    const m = wire.safe_message.trim();
    if (m && m.length <= 300 && !containsClinicalClaim(m) && !detectInjection(m) && !/https?:\/\//i.test(m)) safe = m;
  }

  // ---- warnings (server-generated, factual) ---------------------------------
  if (droppedUngrounded > 0)
    warnings.push(`${droppedUngrounded} AI item(s) could not be matched to your text and were removed.`);
  if (droppedClinical > 0)
    warnings.push(`${droppedClinical} item(s) looked like clinical instructions and were removed. Please follow your healthcare team's guidance directly.`);
  if (droppedInjected > 0 || sourceInjection)
    warnings.push("Part of the text looked like an instruction to the AI. It was ignored.");
  if (language === "other")
    warnings.push("CareLoop is only tested with English and Hindi. Please review everything carefully.");

  const candidate: FinalResult = {
    summary,
    language_detected: language,
    appointment,
    tasks,
    missing_or_ambiguous: missing.slice(0, 20),
    clinical: { content_detected: content, advice_requested: advice, urgent_concern_detected: false },
    safe_message: safe,
  };
  const parsed = FinalResultSchema.safeParse(candidate);
  if (!parsed.success) throw new CareNavError("AI_INVALID_OUTPUT", 502);
  return { result: parsed.data, warnings };
}

/** Result returned when the deterministic urgent-concern guard fires (no AI call). */
export function urgentGuardResult(): FinalResult {
  return {
    summary: "No tasks were extracted because the text mentions a possible urgent concern.",
    language_detected: "unknown",
    appointment: { title: null, date: null, time: null, location: null, department: null },
    tasks: [],
    missing_or_ambiguous: [],
    clinical: { content_detected: true, advice_requested: false, urgent_concern_detected: true },
    safe_message: MESSAGES.urgent,
  };
}
