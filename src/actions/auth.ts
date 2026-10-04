"use server";

import { redirect } from "next/navigation";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { safeNextPath } from "@/lib/auth";
import { forgotPasswordSchema, signInSchema, signUpSchema, updatePasswordSchema } from "@/lib/validation/auth";
import { formToObject, validationFailure } from "@/lib/validation/form";
import { withValues, type ActionState } from "@/lib/action-result";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/errors";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";
import { absoluteUrl, siteConfig } from "@/config/site";

const NOT_CONFIGURED: ActionState = { ok: false, message: "Accounts open soon. Please try again later." };

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = signUpSchema.safeParse(formToObject(formData));
  if (!parsed.success) return withValues(validationFailure(parsed.error), formData);
  if (!(await rateLimit("signup", 5, 3600))) {
    return withValues({ ok: false, message: "Too many sign-up attempts. Please try again later." }, formData);
  }

  const { email, password, username, platform, region, language, marketing_opt_in } = parsed.data;

  const { data: taken } = await createPublicClient().from("profiles").select("id").ilike("username", username.replace(/_/g, "\\_")).maybeSingle();
  if (taken) {
    return withValues({ ok: false, fieldErrors: { username: ["That username is taken."] }, message: "Please fix the highlighted fields." }, formData);
  }

  const next = safeNextPath(formData.get("next"), "/find");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(next)}&verified=1`),
      data: {
        username,
        platform,
        region,
        language,
        // Stored separately from the account; confirmed only once the e-mail is verified.
        marketing_opt_in,
        consent_version: siteConfig.consentVersion,
      },
    },
  });

  if (error) {
    logError("signUp", `${error.code ?? "unknown"} (${error.status ?? "?"}): ${error.message}`);
    return withValues({ ok: false, message: signUpErrorMessage(error) }, formData);
  }

  // With e-mail enumeration protection on, Supabase answers a sign-up for an
  // existing address with a placeholder user without identities and sends no e-mail.
  if (data.user && data.user.identities?.length === 0) {
    return withValues(
      { ok: false, message: "An account with this e-mail already exists. Sign in, or reset your password if you forgot it." },
      formData,
    );
  }

  await trackServer(EVENTS.signupCompleted, { props: { platform, region, marketing_opt_in } });
  // With "Confirm email" off in Supabase the user is signed in right away.
  if (data.session) redirect(next);
  redirect(`/sign-up/check-email?email=${encodeURIComponent(email)}`);
}

/**
 * Maps Supabase Auth sign-up errors to a message the user can act on.
 * Codes: https://supabase.com/docs/guides/auth/debugging/error-codes
 */
function signUpErrorMessage(error: { code?: string; status?: number; message: string }): string {
  switch (error.code) {
    case "weak_password":
      return "Choose a stronger password.";
    case "email_address_invalid":
      return "That e-mail address can't be used. Try another one.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this e-mail already exists. Sign in, or reset your password if you forgot it.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "We're sending too many e-mails right now. Please try again in a few minutes.";
    // Supabase's built-in SMTP only delivers to the project's own team members.
    case "email_address_not_authorized":
    case "signup_disabled":
    case "email_provider_disabled":
      return "Sign-ups are temporarily unavailable. Please try again later.";
  }
  if (error.status === 429) return "Too many attempts. Please try again later.";
  if (/password/i.test(error.message)) return "Choose a stronger password.";
  return "We couldn't create your account. Please try again.";
}

export async function resendVerification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = forgotPasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  if (!(await rateLimit("resend", 3, 3600))) return { ok: false, message: "Too many attempts. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: absoluteUrl("/auth/callback?next=/find&verified=1") },
  });
  if (error) {
    logError("resendVerification", `${error.code ?? "unknown"} (${error.status ?? "?"}): ${error.message}`);
    return { ok: false, message: signUpErrorMessage(error) };
  }
  return { ok: true, message: "Sent. Check your inbox (and spam folder) in a minute." };
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = signInSchema.safeParse(formToObject(formData));
  if (!parsed.success) return withValues(validationFailure(parsed.error), formData);
  if (!(await rateLimit("signin", 10, 600))) {
    return withValues({ ok: false, message: "Too many attempts. Please wait a few minutes." }, formData);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const message = /confirm/i.test(error.message)
      ? "Verify your e-mail address first. Check your inbox for the link."
      : "Wrong e-mail or password.";
    return withValues({ ok: false, message }, formData);
  }
  redirect(safeNextPath(formData.get("next"), "/find"));
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = forgotPasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  if (!(await rateLimit("reset", 5, 3600))) return { ok: false, message: "Too many attempts. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl("/auth/callback?next=/account/password"),
  });
  if (error) logError("requestPasswordReset", error);
  // Same answer whether or not the account exists.
  return { ok: true, message: "If an account exists for that address, we've sent a reset link." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = updatePasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logError("updatePassword", error);
    return { ok: false, message: "We couldn't update your password. Request a new reset link and try again." };
  }
  return { ok: true, message: "Password updated." };
}
