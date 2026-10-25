import { z } from "zod";
import {
  FACT_FIELDS,
  LANGUAGES,
  MAX_LABEL_CHARS,
  MAX_QUOTE_CHARS,
  TASK_CATEGORIES,
  TASK_ORIGINS,
} from "./constants";

/* ------------------------------------------------------------------ *
 * 1) JSON Schema sent to Sarvam (response_format.json_schema.schema).
 *    Deliberately limited to the most widely supported subset: objects,
 *    arrays, strings, booleans, enums. No nullable unions: "absent" is
 *    expressed by omitting an array element (facts) or "" (due_text,
 *    source_quote), which we normalise to null server-side.
 * ------------------------------------------------------------------ */
export const WIRE_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    language_detected: { type: "string", enum: [...LANGUAGES] },
    appointment_facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string", enum: [...FACT_FIELDS] },
          value: { type: "string" },
          source_quote: { type: "string" },
        },
        required: ["field", "value", "source_quote"],
        additionalProperties: false,
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          category: { type: "string", enum: [...TASK_CATEGORIES] },
          origin: { type: "string", enum: [...TASK_ORIGINS] },
          due_text: { type: "string" },
          source_quote: { type: "string" },
        },
        required: ["label", "category", "origin", "due_text", "source_quote"],
        additionalProperties: false,
      },
    },
    missing_or_ambiguous: {
      type: "array",
      items: {
        type: "object",
        properties: { topic: { type: "string" }, note: { type: "string" } },
        required: ["topic", "note"],
        additionalProperties: false,
      },
    },
    clinical_content_detected: { type: "boolean" },
    clinical_advice_requested: { type: "boolean" },
    safe_message: { type: "string" },
  },
  required: [
    "summary",
    "language_detected",
    "appointment_facts",
    "tasks",
    "missing_or_ambiguous",
    "clinical_content_detected",
    "clinical_advice_requested",
    "safe_message",
  ],
  additionalProperties: false,
} as const;

/* ------------------------------------------------------------------ *
 * 2) Zod "wire" schema: validates the raw parsed model output.
 *    .strict() rejects unexpected keys (mirrors additionalProperties:false).
 * ------------------------------------------------------------------ */
export const WireSchema = z
  .object({
    summary: z.string().max(1000),
    language_detected: z.enum(LANGUAGES),
    appointment_facts: z
      .array(
        z
          .object({
            field: z.enum(FACT_FIELDS),
            value: z.string().max(MAX_LABEL_CHARS * 2),
            source_quote: z.string().max(MAX_QUOTE_CHARS * 2),
          })
          .strict()
      )
      .max(20),
    tasks: z
      .array(
        z
          .object({
            label: z.string().max(MAX_LABEL_CHARS * 2),
            category: z.enum(TASK_CATEGORIES),
            origin: z.enum(TASK_ORIGINS),
            due_text: z.string().max(MAX_LABEL_CHARS * 2),
            source_quote: z.string().max(MAX_QUOTE_CHARS * 2),
          })
          .strict()
      )
      .max(40),
    missing_or_ambiguous: z
      .array(
        z
          .object({ topic: z.string().max(200), note: z.string().max(400) })
          .strict()
      )
      .max(20),
    clinical_content_detected: z.boolean(),
    clinical_advice_requested: z.boolean(),
    safe_message: z.string().max(1000),
  })
  .strict();
export type WireOutput = z.infer<typeof WireSchema>;

/* ------------------------------------------------------------------ *
 * 3) Final, normalised result returned to the UI. Validated again after
 *    grounding/safety post-processing. Invariants are enforced here:
 *    explicit tasks MUST carry a source quote; nothing is "done".
 * ------------------------------------------------------------------ */
const FactSchema = z
  .object({ value: z.string().min(1).max(280), source_quote: z.string().min(1).max(600) })
  .strict();

export const FinalTaskSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1).max(MAX_LABEL_CHARS),
    category: z.enum(TASK_CATEGORIES),
    origin: z.enum(TASK_ORIGINS),
    due_text: z.string().min(1).nullable(),
    source_quote: z.string().min(1).nullable(),
  })
  .strict()
  .refine((t) => t.origin !== "explicit" || t.source_quote !== null, {
    message: "explicit tasks require a source quotation",
  });

export const FinalResultSchema = z
  .object({
    summary: z.string().min(1).max(600),
    language_detected: z.enum(LANGUAGES),
    appointment: z
      .object({
        title: FactSchema.nullable(),
        date: FactSchema.nullable(),
        time: FactSchema.nullable(),
        location: FactSchema.nullable(),
        department: FactSchema.nullable(),
      })
      .strict(),
    tasks: z.array(FinalTaskSchema).max(12),
    missing_or_ambiguous: z
      .array(z.object({ topic: z.string(), note: z.string() }).strict())
      .max(20),
    clinical: z
      .object({
        content_detected: z.boolean(),
        advice_requested: z.boolean(),
        urgent_concern_detected: z.boolean(),
      })
      .strict(),
    safe_message: z.string().min(1).max(600),
  })
  .strict();

export type FinalResult = z.infer<typeof FinalResultSchema>;
export type FinalTask = z.infer<typeof FinalTaskSchema>;
export type Fact = z.infer<typeof FactSchema>;

/* ------------------------------------------------------------------ *
 * 4) Request + API envelope types
 * ------------------------------------------------------------------ */
export const RequestSchema = z
  .object({ text: z.string() })
  .strict();

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "INPUT_TOO_LARGE"
  | "RATE_LIMITED"
  | "DEMO_UNAUTHORIZED"
  | "DEMO_PROTECTION_UNAVAILABLE"
  | "AI_NOT_CONFIGURED"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "AI_AUTH_FAILED"
  | "AI_PROVIDER_ERROR"
  | "AI_INVALID_OUTPUT";

export type ApiSuccess = {
  ok: true;
  /** "sarvam-live" = produced by a real Sarvam call. "safety-guard" = deterministic server check, NO AI call. */
  source: "sarvam-live" | "safety-guard";
  model: string | null;
  result: FinalResult;
  warnings: string[];
};
export type ApiFailure = {
  ok: false;
  error: { code: ApiErrorCode; message: string };
};
export type ApiResponse = ApiSuccess | ApiFailure;
