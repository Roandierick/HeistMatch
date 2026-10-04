import { NextResponse, type NextRequest } from "next/server";
import { analyticsEventSchema } from "@/lib/validation/misc";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { EVENTS } from "@/lib/analytics/events";

const ALLOWED = new Set<string>(Object.values(EVENTS));

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv() || !hasServiceRole()) return new NextResponse(null, { status: 204 });

  // Same-origin only.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success || !ALLOWED.has(parsed.data.name)) return new NextResponse(null, { status: 400 });

  if (!(await rateLimit("events", 120, 60))) return new NextResponse(null, { status: 429 });

  const { name, path, referrer, session_id, props } = parsed.data;
  let referrerHost: string | null = null;
  try {
    referrerHost = referrer ? new URL(referrer).host : null;
  } catch {
    referrerHost = null;
  }
  if (referrerHost === request.nextUrl.host) referrerHost = null;

  await createAdminClient().from("analytics_events").insert({
    name,
    path: path ?? null,
    referrer_host: referrerHost,
    session_id: session_id ?? null,
    props: props ?? {},
  });
  return new NextResponse(null, { status: 204 });
}
