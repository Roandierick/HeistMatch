import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Tables } from "@/types/database";

export type SessionUser = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  profile: Tables<"profiles"> | null;
};

/** Current user (validated against Supabase Auth), memoized per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    emailVerified: Boolean(data.user.email_confirmed_at),
    profile,
  };
});

export async function requireUser(next = "/"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (user.profile?.role !== "admin" || user.profile.is_banned) redirect("/");
  return user;
}

export { safeNextPath } from "@/lib/safe-next";
