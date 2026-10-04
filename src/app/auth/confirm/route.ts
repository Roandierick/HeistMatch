import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

const TYPES: EmailOtpType[] = ["signup", "email", "recovery", "email_change", "invite", "magiclink"];

/**
 * Token-hash confirmation (recommended e-mail template:
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/find).
 * Works across devices, unlike the PKCE code flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), type === "recovery" ? "/account/password" : "/find");

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (type === "signup" || type === "email") await trackServer(EVENTS.emailVerified, { userId: data.user?.id });
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/sign-in?error=link`);
}
