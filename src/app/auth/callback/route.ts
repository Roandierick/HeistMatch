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

  const verified = searchParams.get("verified") === "1";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (verified) await trackServer(EVENTS.emailVerified, { userId: data.user?.id });
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Supabase confirms the address before redirecting here with a code. The
    // exchange only fails when the link is opened in another browser or device
    // (no PKCE verifier cookie), so the account is verified: ask to sign in.
    if (verified) {
      return NextResponse.redirect(`${origin}/sign-in?verified=1&next=${encodeURIComponent(next)}`);
    }
  }
  return NextResponse.redirect(`${origin}/sign-in?error=link`);
}
