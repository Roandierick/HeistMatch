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
  const { error } = await supabase.auth.signUp({
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
    logError("signUp", error);
    const message = /password/i.test(error.message)
      ? "Choose a stronger password."
      : error.status === 429
        ? "Too many attempts. Please try again later."
        : "We couldn't create your account. Please try again.";
    return withValues({ ok: false, message }, formData);
  }

  await trackServer(EVENTS.signupCompleted, { props: { platform, region, marketing_opt_in } });
  redirect(`/sign-up/check-email?email=${encodeURIComponent(email)}`);
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
