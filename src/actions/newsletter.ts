"use server";

import { newsletterSchema } from "@/lib/validation/misc";
import { formToObject } from "@/lib/validation/form";
import type { ActionState } from "@/lib/action-result";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { newsletterConfirmEmail, newsletterEmailAvailable, sendEmail } from "@/lib/email";
import { logError } from "@/lib/errors";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";

const DONE_MESSAGE = "Check your inbox and confirm your subscription.";

/**
 * Double opt-in newsletter signup. Responses are identical whether or not the
 * address already exists, so the form can't be used to probe the list.
 */
export async function subscribeNewsletter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid e-mail address." };
  }
  if (parsed.data.company) return { ok: true, message: DONE_MESSAGE }; // honeypot hit
  if (!hasSupabaseEnv() || !hasServiceRole() || !newsletterEmailAvailable()) {
    return { ok: false, message: "Newsletter signups open soon. Please try again later." };
  }
  if (!(await rateLimit("newsletter", 5, 3600))) {
    return { ok: false, message: "Too many attempts. Please try again later." };
  }

  const { email, source } = parsed.data;
  const user = await getCurrentUser();
  const admin = createAdminClient();

  try {
    const { data: existing } = await admin.from("marketing_consents").select("*").eq("email", email).maybeSingle();
    if (existing?.status === "confirmed") return { ok: true, message: "You're already subscribed. Thanks!" };

    let row = existing;
    if (!row) {
      const { data, error } = await admin
        .from("marketing_consents")
        .insert({
          email,
          user_id: user && user.email?.toLowerCase() === email ? user.id : null,
          consent_version: siteConfig.consentVersion,
          source,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      row = data;
    } else {
      // Re-subscribe or resend: new confirm token, keep the audit trail.
      const { data, error } = await admin
        .from("marketing_consents")
        .update({ status: "pending", consent_version: siteConfig.consentVersion, source, withdrawn_at: null, confirm_token: crypto.randomUUID() })
        .eq("id", row.id)
        .select("*")
        .single();
      if (error) throw error;
      row = data;
    }

    await admin.from("consent_events").insert({
      consent_id: row.id,
      event: "opt_in_requested",
      consent_version: siteConfig.consentVersion,
      source,
    });
    const sent = await sendEmail({ to: email, ...newsletterConfirmEmail(row.confirm_token, row.unsubscribe_token) });
    if (!sent) return { ok: false, message: "We couldn't send the confirmation e-mail. Please try again later." };
    await trackServer(EVENTS.newsletterSubscribed, { userId: user?.id, props: { source } });
    return { ok: true, message: DONE_MESSAGE };
  } catch (error) {
    logError("subscribeNewsletter", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confirm step of the double opt-in. A button click (POST), so link scanners can't confirm. */
export async function confirmNewsletter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!TOKEN.test(token) || !hasServiceRole()) return { ok: false, message: "This confirmation link is invalid or has expired." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketing_consents")
    .update({ status: "confirmed", consent: true, confirmed_at: new Date().toISOString(), withdrawn_at: null })
    .eq("confirm_token", token)
    .eq("status", "pending")
    .select("id, consent_version, source")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "This confirmation link is invalid, expired or already used." };
  await admin.from("consent_events").insert({ consent_id: data.id, event: "confirmed", consent_version: data.consent_version, source: data.source });
  await trackServer(EVENTS.newsletterConfirmed, { props: { source: data.source } });
  return { ok: true, message: "You're subscribed. Welcome to HeistMatch!" };
}

export async function unsubscribeNewsletter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!TOKEN.test(token) || !hasServiceRole()) return { ok: false, message: "This unsubscribe link is invalid." };
  const admin = createAdminClient();
  const { data: row } = await admin.from("marketing_consents").select("id, status, consent_version").eq("unsubscribe_token", token).maybeSingle();
  if (!row) return { ok: false, message: "This unsubscribe link is invalid." };
  if (row.status !== "unsubscribed") {
    await admin
      .from("marketing_consents")
      .update({ status: "unsubscribed", consent: false, withdrawn_at: new Date().toISOString() })
      .eq("id", row.id);
    await admin.from("consent_events").insert({ consent_id: row.id, event: "withdrawn", consent_version: row.consent_version, source: "newsletter_home" });
  }
  return { ok: true, message: "You're unsubscribed. You won't receive marketing e-mails from us anymore." };
}
