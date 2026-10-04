import {
  LANGUAGES, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS,
  type Language, type Platform, type Playstyle, type Region, type SkillLevel,
} from "@/config/options";

/** Finder filters as stored in the URL (/find?platform=ps5&region=eu&mic=true). */
export type HeistFilters = {
  platform?: Platform;
  region?: Region;
  language?: Language;
  heist?: string;
  mic?: boolean;
  skill?: SkillLevel;
  playstyle?: Playstyle;
  when?: "now" | "scheduled";
  slots?: number;
  sort: "soonest" | "newest";
  page: number;
};

export const FILTER_KEYS = ["platform", "region", "language", "heist", "mic", "skill", "playstyle", "when", "slots"] as const;

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function pick<T extends string>(options: readonly { value: T }[], raw: string | undefined): T | undefined {
  return options.find((o) => o.value === raw)?.value;
}

export function parseFilters(params: RawParams): HeistFilters {
  const mic = first(params.mic);
  const when = first(params.when);
  const slots = Number.parseInt(first(params.slots) ?? "", 10);
  const page = Number.parseInt(first(params.page) ?? "", 10);
  const heist = first(params.heist);
  return {
    platform: pick(PLATFORMS, first(params.platform)),
    region: pick(REGIONS, first(params.region)),
    language: pick(LANGUAGES, first(params.language)),
    heist: heist && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(heist) && heist.length <= 60 ? heist : undefined,
    mic: mic === "true" ? true : mic === "false" ? false : undefined,
    skill: pick(SKILL_LEVELS, first(params.skill)),
    playstyle: pick(PLAYSTYLES, first(params.playstyle)),
    when: when === "now" || when === "scheduled" ? when : undefined,
    slots: Number.isFinite(slots) && slots >= 1 && slots <= 7 ? slots : undefined,
    sort: first(params.sort) === "newest" ? "newest" : "soonest",
    page: Number.isFinite(page) && page >= 1 && page <= 50 ? page : 1,
  };
}

export function activeFilterCount(filters: HeistFilters): number {
  return FILTER_KEYS.filter((k) => filters[k] !== undefined).length;
}

export function filtersToSearchParams(filters: Partial<HeistFilters>): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value !== undefined) params.set(key, String(value));
  }
  if (filters.sort && filters.sort !== "soonest") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function findHref(filters: Partial<HeistFilters>): string {
  const qs = filtersToSearchParams(filters).toString();
  return qs ? `/find?${qs}` : "/find";
}

/** "Start now" means starting within the next 30 minutes (or already started). */
export const START_NOW_WINDOW_MS = 30 * 60_000;

export function isStartingSoon(startAt: string): boolean {
  return new Date(startAt).getTime() <= Date.now() + START_NOW_WINDOW_MS;
}
