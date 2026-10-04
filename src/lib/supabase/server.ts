import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv, serverEnv } from "@/lib/env";

/** Per-request client bound to the visitor's session cookies (RLS as that user). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
        }
      },
    },
  });
}

/**
 * Cookie-less anonymous client for public, cacheable reads (listings, blog).
 * Using it keeps pages statically renderable / ISR-friendly.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service-role client. Bypasses RLS: only for narrowly scoped server-side writes. */
export function createAdminClient() {
  const { serviceRoleKey } = serverEnv();
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceRole(): boolean {
  return Boolean(serverEnv().serviceRoleKey);
}
