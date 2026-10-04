import "server-only";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { logError } from "@/lib/errors";
import type { Json } from "@/types/database";
import type { EventName } from "./events";

/** Server-side first-party event. Never throws: analytics must not break a user flow. */
export async function trackServer(
  name: EventName,
  { userId, path, props }: { userId?: string | null; path?: string; props?: Record<string, Json> } = {},
) {
  if (!hasSupabaseEnv() || !hasServiceRole()) return;
  try {
    await createAdminClient().from("analytics_events").insert({ name, user_id: userId ?? null, path: path ?? null, props: props ?? {} });
  } catch (error) {
    logError("trackServer", error);
  }
}
