import type { ApiErrorCode } from "./schema";

export class CareNavError extends Error {
  code: ApiErrorCode;
  status: number;
  constructor(code: ApiErrorCode, status: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

/** User-facing messages. Never include provider bodies, keys or user text. */
export const USER_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_INPUT: "Please paste some text to organize.",
  INPUT_TOO_LARGE: "That text is too long. Please paste a shorter excerpt.",
  RATE_LIMITED: "The demo request quota has been reached. Try again in a minute; if the daily budget is used, contact the demo organizer or return tomorrow.",
  DEMO_UNAUTHORIZED: "This request was blocked because it did not come from the CareLoop website.",
  DEMO_PROTECTION_UNAVAILABLE: "Public-demo request quota protection is unavailable. AI requests are disabled. Please contact the demo organizer.",
  AI_NOT_CONFIGURED:
    "The AI service isn't set up on this server, so CareLoop can't read your text right now. Please try again later.",
  AI_TIMEOUT: "The AI service took too long to respond. Please try again.",
  AI_RATE_LIMITED: "The AI service is busy right now. Please try again in a moment.",
  AI_AUTH_FAILED:
    "The AI service rejected this server's credentials. Please contact whoever runs this deployment.",
  AI_PROVIDER_ERROR: "The AI service is unavailable right now. Please try again later.",
  AI_INVALID_OUTPUT:
    "The AI returned a response CareLoop couldn't safely use, so nothing was extracted. Please try again.",
};
