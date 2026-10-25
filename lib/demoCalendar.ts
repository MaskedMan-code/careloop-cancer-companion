// A fixed fictional clock: never depends on the browser/server date or timezone.
export const DEMO_TODAY = "2026-10-25";
export const DEMO_APPOINTMENT_DATE = "2026-10-26";
export const DEMO_CREATED_AT = "2026-10-25T09:00:00.000Z";

export function dateDay(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error("Expected an ISO calendar date");
  const date = new Date(`${iso}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== iso) throw new Error("Invalid calendar date");
  return Math.floor(date.getTime() / 86_400_000);
}

export function formatDemoDate(iso: string): string {
  dateDay(iso);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

export function relativeDemoDate(iso: string, today = DEMO_TODAY): string {
  const days = dateDay(iso) - dateDay(today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 1 ? `In ${days} days` : `${Math.abs(days)} days ago`;
}

export const DEMO_APPOINTMENT_LABEL = formatDemoDate(DEMO_APPOINTMENT_DATE);
export const SAMPLE_EN = `Dear Ayesha Khan, your oncology OPD appointment is on ${DEMO_APPOINTMENT_LABEL} at 10:30 AM at Sunrise Cancer Institute, Oncology OPD, 2nd Floor. Please carry your appointment slip and previous reports. Confirm your appointment by calling the helpdesk at least one day before.`;
export const SAMPLE_HI = "आपकी अपॉइंटमेंट 26 अक्टूबर 2026 को सुबह 10:30 बजे सनराइज़ कैंसर इंस्टीट्यूट, ओपीडी में है। कृपया अपना अपॉइंटमेंट स्लिप साथ लाएं।";
