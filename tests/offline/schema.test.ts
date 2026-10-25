import { describe, expect, it } from "vitest";
import {
  FACT_FIELDS, LANGUAGES, TASK_CATEGORIES, TASK_ORIGINS,
} from "@/lib/care-navigation/constants";
import { FinalResultSchema, WIRE_JSON_SCHEMA, WireSchema } from "@/lib/care-navigation/schema";
import { wire } from "../fixtures/care-navigation-cases";

type JS = { type?: string; properties?: Record<string, JS>; required?: string[]; items?: JS; additionalProperties?: boolean; enum?: string[] };

function walkObjects(node: JS, visit: (o: JS) => void) {
  if (node.type === "object") {
    visit(node);
    Object.values(node.properties ?? {}).forEach((c) => walkObjects(c, visit));
  }
  if (node.type === "array" && node.items) walkObjects(node.items, visit);
}

describe("WIRE_JSON_SCHEMA (sent to Sarvam in strict mode)", () => {
  it("every object forbids extra keys and lists all properties as required", () => {
    let count = 0;
    walkObjects(WIRE_JSON_SCHEMA as unknown as JS, (o) => {
      count++;
      expect(o.additionalProperties).toBe(false);
      expect([...(o.required ?? [])].sort()).toEqual(Object.keys(o.properties ?? {}).sort());
    });
    expect(count).toBe(4); // root + fact + task + missing-item
  });

  it("uses only the conservative type subset (no nullable unions / anyOf)", () => {
    const text = JSON.stringify(WIRE_JSON_SCHEMA);
    expect(text).not.toMatch(/anyOf|oneOf|allOf|"null"|\$ref|pattern|format/);
  });

  it("enums match the constants used by the Zod schema", () => {
    const p = WIRE_JSON_SCHEMA.properties;
    expect(p.language_detected.enum).toEqual([...LANGUAGES]);
    expect(p.appointment_facts.items.properties.field.enum).toEqual([...FACT_FIELDS]);
    expect(p.tasks.items.properties.category.enum).toEqual([...TASK_CATEGORIES]);
    expect(p.tasks.items.properties.origin.enum).toEqual([...TASK_ORIGINS]);
  });

  it("has no completion/status field the model could set", () => {
    expect(JSON.stringify(WIRE_JSON_SCHEMA)).not.toMatch(/done|complete|status/i);
  });
});

describe("WireSchema (runtime validation of model output)", () => {
  it("accepts a well-formed object", () => {
    expect(WireSchema.safeParse(wire()).success).toBe(true);
  });
  it("rejects extra keys, wrong types, bad enums and missing keys", () => {
    expect(WireSchema.safeParse({ ...wire(), diagnosis: "x" }).success).toBe(false);
    expect(WireSchema.safeParse({ ...wire(), tasks: "no" }).success).toBe(false);
    expect(WireSchema.safeParse({ ...wire(), language_detected: "klingon" }).success).toBe(false);
    const { summary: _omit, ...rest } = wire();
    expect(WireSchema.safeParse(rest).success).toBe(false);
  });
});

describe("FinalResultSchema invariants", () => {
  const base = {
    summary: "s", language_detected: "english",
    appointment: { title: null, date: null, time: null, location: null, department: null },
    tasks: [], missing_or_ambiguous: [],
    clinical: { content_detected: false, advice_requested: false, urgent_concern_detected: false },
    safe_message: "m",
  };
  it("rejects an explicit task with no source quotation", () => {
    const bad = { ...base, tasks: [{ id: "t1", label: "x", category: "other", origin: "explicit", due_text: null, source_quote: null }] };
    expect(FinalResultSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a completion flag smuggled into a task", () => {
    const bad = { ...base, tasks: [{ id: "t1", label: "x", category: "other", origin: "suggestion", due_text: null, source_quote: null, done: true }] };
    expect(FinalResultSchema.safeParse(bad).success).toBe(false);
  });
});
