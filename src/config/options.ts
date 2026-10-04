// Single source of truth for listing/profile options. Values mirror the check
// constraints in supabase/migrations; add a value there before adding it here.

export type Option<T extends string = string> = { value: T; label: string; short?: string };

export const PLATFORMS = [
  { value: "ps5", label: "PlayStation 5", short: "PS5" },
  { value: "xbox", label: "Xbox Series X|S", short: "Xbox" },
  { value: "pc", label: "PC", short: "PC" },
] as const satisfies readonly Option[];

export const REGIONS = [
  { value: "eu", label: "Europe", short: "EU" },
  { value: "na", label: "North America", short: "NA" },
  { value: "sa", label: "South America", short: "SA" },
  { value: "asia", label: "Asia", short: "Asia" },
  { value: "oce", label: "Oceania", short: "OCE" },
  { value: "mea", label: "Middle East & Africa", short: "MEA" },
] as const satisfies readonly Option[];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "nl", label: "Nederlands" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
  { value: "tr", label: "Türkçe" },
  { value: "ru", label: "Русский" },
  { value: "ar", label: "العربية" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
] as const satisfies readonly Option[];

export const SKILL_LEVELS = [
  { value: "any", label: "Any skill" },
  { value: "beginner", label: "Beginner friendly" },
  { value: "intermediate", label: "Intermediate" },
  { value: "experienced", label: "Experienced only" },
] as const satisfies readonly Option[];

export const PLAYSTYLES = [
  { value: "casual", label: "Casual" },
  { value: "normal", label: "Normal" },
  { value: "experienced", label: "Experienced" },
  { value: "efficient", label: "Efficient" },
  { value: "speedrun", label: "Speedrun" },
] as const satisfies readonly Option[];

export const PAYOUT_SPLITS = [
  { value: "equal", label: "Equal split" },
  { value: "host_favored", label: "Host takes more" },
  { value: "negotiable", label: "Negotiable" },
] as const satisfies readonly Option[];

export const REPORT_REASONS = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "scam", label: "Scam or fraud" },
  { value: "cheating", label: "Cheating or modding" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
] as const satisfies readonly Option[];

export const HEIST_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  full: "Full",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  removed: "Removed",
};

export const MAX_PLAYERS_NEEDED = 7;

export type Platform = (typeof PLATFORMS)[number]["value"];
export type Region = (typeof REGIONS)[number]["value"];
export type Language = (typeof LANGUAGES)[number]["value"];
export type SkillLevel = (typeof SKILL_LEVELS)[number]["value"];
export type Playstyle = (typeof PLAYSTYLES)[number]["value"];
export type PayoutSplit = (typeof PAYOUT_SPLITS)[number]["value"];
export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const values = <T extends string>(options: readonly Option<T>[]) =>
  options.map((o) => o.value) as [T, ...T[]];

export function labelOf(options: readonly Option[], value: string | null | undefined, useShort = false): string {
  const option = options.find((o) => o.value === value);
  if (!option) return value ?? "";
  return useShort && option.short ? option.short : option.label;
}
