import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { hasSupabaseEnv, publicEnv } from "@/lib/env";

/** Refreshes the Supabase session cookie and returns the response plus the user id. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv()) return { response, userId: null as string | null };

  const supabase = createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims() validates the JWT; do not put logic between client creation and this call.
  const { data } = await supabase.auth.getClaims();
  return { response, userId: (data?.claims?.sub as string | undefined) ?? null };
}
