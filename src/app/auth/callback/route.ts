import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

/** PKCE callback for e-mail verification, password recovery and OAuth. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/find");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (searchParams.get("verified") === "1") {
        await trackServer(EVENTS.emailVerified, { userId: data.user?.id });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/sign-in?error=link`);
}
