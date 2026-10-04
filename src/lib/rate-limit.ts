import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { logError } from "@/lib/errors";

/** Client IP, hashed with a secret salt. Raw IPs are never stored. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${serverEnv().rateLimitSalt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Database-backed fixed-window limiter (works across serverless instances).
 * Fails open when the backend is not configured or errors, so a limiter
 * outage never blocks real users; per-user limits also live in SQL triggers.
 */
export async function rateLimit(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!hasServiceRole()) return true;
  try {
    const key = `${bucket}:${await clientKey()}`;
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data !== false;
  } catch (error) {
    logError("rateLimit", error);
    return true;
  }
}
