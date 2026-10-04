// Basic, dependency-free content checks for user-generated text.
// Intentionally conservative: block obvious spam/abuse, let moderation handle the rest.

const BLOCKED_TERMS = [
  "nigger", "nigga", "faggot", "retard", "kys", "kill yourself",
  "cheap money drop", "money drop service", "modded account", "mod menu", "recovery service",
];

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|gg|io|xyz|ru|shop|store|link)\b)/i;
const REPEATED_CHARS = /(.)\1{9,}/;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[0@]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[$5]/g, "s")
    .replace(/\s+/g, " ");
}

export type ModerationResult = { ok: true } | { ok: false; reason: string };

export function checkUserText(text: string, { allowLinks = false } = {}): ModerationResult {
  if (!text) return { ok: true };
  const normalized = normalize(text);
  if (BLOCKED_TERMS.some((term) => normalized.includes(term))) {
    return { ok: false, reason: "Please keep it respectful and free of spam." };
  }
  if (!allowLinks && URL_PATTERN.test(text)) {
    return { ok: false, reason: "Links aren't allowed in listings. Share contact details with your crew after joining." };
  }
  if (REPEATED_CHARS.test(text)) {
    return { ok: false, reason: "That looks like spam. Please write a normal message." };
  }
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length > 20 && letters === letters.toUpperCase()) {
    return { ok: false, reason: "Please don't write in all caps." };
  }
  return { ok: true };
}

/** Collapse whitespace and strip control characters. Rendering is always escaped by React. */
export function cleanText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
