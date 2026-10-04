import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { logError } from "@/lib/errors";
import { START_NOW_WINDOW_MS, type HeistFilters } from "@/lib/filters";
import type { Tables } from "@/types/database";

export type HeistType = Tables<"heist_types">;

export type HeistListing = Tables<"heists"> & {
  host: { username: string; avatar_url: string | null } | null;
  heist_type_ref: { name: string; game: string } | null;
  hostStats: { avg_rating: number | null; review_count: number; play_again_pct: number | null } | null;
};

export const FINDER_PAGE_SIZE = 24;

const LISTING_SELECT =
  "*, host:profiles!heists_host_user_id_fkey(username, avatar_url), heist_type_ref:heist_types(name, game)" as const;

export async function getHeistTypes(): Promise<HeistType[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await createPublicClient()
    .from("heist_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    logError("getHeistTypes", error);
    return [];
  }
  return data;
}

async function attachHostStats<T extends Tables<"heists">>(rows: T[]) {
  const hostIds = [...new Set(rows.map((r) => r.host_user_id))];
  if (hostIds.length === 0) return rows.map((r) => ({ ...r, hostStats: null }));
  const { data } = await createPublicClient()
    .from("profile_stats")
    .select("user_id, avg_rating, review_count, play_again_pct")
    .in("user_id", hostIds);
  const byId = new Map((data ?? []).map((s) => [s.user_id, s]));
  return rows.map((r) => ({ ...r, hostStats: byId.get(r.host_user_id) ?? null }));
}

export async function listOpenHeists(
  filters: Partial<HeistFilters> = {},
  { limit = FINDER_PAGE_SIZE, page = 1 }: { limit?: number; page?: number } = {},
): Promise<{ listings: HeistListing[]; total: number; error: boolean }> {
  if (!hasSupabaseEnv()) return { listings: [], total: 0, error: false };

  const nowIso = new Date().toISOString();
  const soonIso = new Date(Date.now() + START_NOW_WINDOW_MS).toISOString();

  let query = createPublicClient()
    .from("heists")
    .select(LISTING_SELECT, { count: "estimated" })
    .eq("status", "open")
    .gt("expires_at", nowIso);

  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.language) query = query.eq("language", filters.language);
  if (filters.heist) query = query.eq("heist_type", filters.heist);
  if (filters.mic !== undefined) query = query.eq("mic_required", filters.mic);
  if (filters.skill) query = query.eq("skill_level", filters.skill);
  if (filters.playstyle) query = query.eq("playstyle", filters.playstyle);
  if (filters.when === "now") query = query.lte("start_at", soonIso);
  if (filters.when === "scheduled") query = query.gt("start_at", soonIso);
  if (filters.slots) query = query.gte("open_slots", filters.slots);

  query =
    filters.sort === "newest"
      ? query.order("created_at", { ascending: false })
      : query.order("start_at", { ascending: true }).order("created_at", { ascending: false });

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) {
    logError("listOpenHeists", error);
    return { listings: [], total: 0, error: true };
  }
  const listings = (await attachHostStats(data)) as HeistListing[];
  return { listings, total: count ?? listings.length, error: false };
}

export type HeistDetail = HeistListing & {
  members: { user_id: string; status: string; joined_at: string; profile: { username: string } | null }[];
};

/** Memoized per request: generateMetadata and the page share one query. */
export const getHeist = cache(async (id: string): Promise<HeistDetail | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("heists").select(LISTING_SELECT).eq("id", id).maybeSingle();
  if (error) {
    logError("getHeist", error);
    return null;
  }
  if (!data) return null;

  const { data: members } = await supabase
    .from("heist_members")
    .select("user_id, status, joined_at, profile:profiles!heist_members_user_id_fkey(username)")
    .eq("heist_id", id)
    .eq("status", "joined")
    .order("joined_at");

  const [withStats] = await attachHostStats([data]);
  return { ...(withStats as HeistListing), members: members ?? [] };
});

export async function countOpenHeists(): Promise<number> {
  if (!hasSupabaseEnv()) return 0;
  const { count } = await createPublicClient()
    .from("heists")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}
