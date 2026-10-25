export const MAX_INPUT_CHARS = 4000;
export const MAX_TASKS = 12;
export const MAX_SUGGESTIONS = 3;
export const MAX_LABEL_CHARS = 140;
export const MAX_QUOTE_CHARS = 300;
export const PROVIDER_TIMEOUT_MS = 45_000;
export const PROVIDER_MAX_TOKENS = 2500;

export const DEFAULT_MODEL = "sarvam-105b";
// Models served by Sarvam's /v1/chat/completions (per Sarvam docs).
export const ALLOWED_MODELS = ["sarvam-105b", "sarvam-105b-conversations"] as const;
export const SARVAM_ENDPOINT = "https://api.sarvam.ai/v1/chat/completions";

export const RATE_LIMIT_PER_MINUTE = 10;

export const LANGUAGES = ["english", "hindi", "mixed", "other", "unknown"] as const;
export const FACT_FIELDS = ["title", "date", "time", "location", "department"] as const;
export const TASK_CATEGORIES = [
  "appointment",
  "documents",
  "transport",
  "caregiver",
  "communication",
  "preparation",
  "follow_up",
  "other",
] as const;
export const TASK_ORIGINS = ["explicit", "suggestion"] as const;
