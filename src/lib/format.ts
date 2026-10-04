const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return diff <= 0 ? "just now" : "in under a minute";
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  return rtf.format(Math.round(diff / day), "day");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export function formatDateTimeUtc(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  }).format(new Date(iso));
}

export function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

// Time helpers for server-rendered components (each render is a fresh request).
export function isPast(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 3600_000).toISOString();
}

export function nowIso(): string {
  return new Date().toISOString();
}
