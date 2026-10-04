import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Tables, Views } from "@/types/database";

export type PublicProfile = Tables<"profiles"> & { stats: Views<"profile_stats"> | null };

export const getProfileByUsername = cache(async (username: string): Promise<PublicProfile | null> => {
  if (!hasSupabaseEnv() || !/^[A-Za-z0-9_]{3,20}$/.test(username)) return null;
  const supabase = createPublicClient();
  const { data: profile } = await supabase.from("profiles").select("*").ilike("username", username).maybeSingle();
  if (!profile) return null;
  const { data: stats } = await supabase.from("profile_stats").select("*").eq("user_id", profile.id).maybeSingle();
  return { ...profile, stats };
});

export async function getRecentHeistsByHost(userId: string, limit = 6) {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createPublicClient()
    .from("heists")
    .select("id, title, status, start_at, platform, heist_type_ref:heist_types(name)")
    .eq("host_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
