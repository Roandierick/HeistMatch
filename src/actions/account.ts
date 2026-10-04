"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient, createClient, hasServiceRole } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation/profile";
import { formToObject, validationFailure } from "@/lib/validation/form";
import { withValues, type ActionState } from "@/lib/action-result";
import { friendlyDbError, logError } from "@/lib/errors";
import { siteConfig } from "@/config/site";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };
  const parsed = profileSchema.safeParse(formToObject(formData));
  if (!parsed.success) return withValues(validationFailure(parsed.error), formData);

  const { platform_handle, discord_handle, bio, ...profile } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ ...profile, bio: bio || null, languages: [profile.primary_language] })
    .eq("id", user.id);
  if (error) {
    if (error.code === "23505") {
      return withValues({ ok: false, fieldErrors: { username: ["That username is taken."] }, message: "Please fix the highlighted fields." }, formData);
    }
    logError("updateProfile", error);
    return withValues({ ok: false, message: friendlyDbError(error) }, formData);
  }

  const { error: privateError } = await supabase
    .from("profile_private")
    .upsert({ user_id: user.id, platform_handle, discord_handle });
  if (privateError) {
    logError("updateProfile.private", privateError);
    return withValues({ ok: false, message: "Profile saved, but your contact handles could not be saved." }, formData);
  }

  revalidatePath(`/players/${profile.username}`);
  if (user.profile?.username && user.profile.username !== profile.username) revalidatePath(`/players/${user.profile.username}`);
  return { ok: true, message: "Profile saved." };
}

export async function setMarketingConsent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user?.email) return { ok: false, message: "Sign in first." };
  if (!hasServiceRole()) return { ok: false, message: "E-mail preferences are not available yet." };
  const subscribe = formData.get("subscribe") === "true";
  const admin = createAdminClient();
  const email = user.email.toLowerCase();

  try {
    const { data: existing } = await admin.from("marketing_consents").select("*").eq("email", email).maybeSingle();
    if (subscribe) {
      if (!user.emailVerified) return { ok: false, message: "Verify your e-mail address first." };
      // The account address is already verified, so no second confirmation e-mail is needed.
      const now = new Date().toISOString();
      const values = {
        email,
        user_id: user.id,
        consent: true,
        status: "confirmed",
        consent_version: siteConfig.consentVersion,
        source: "account_settings",
        confirmed_at: now,
        withdrawn_at: null,
      };
      const { data, error } = existing
        ? await admin.from("marketing_consents").update(values).eq("id", existing.id).select("id").single()
        : await admin.from("marketing_consents").insert(values).select("id").single();
      if (error) throw error;
      await admin.from("consent_events").insert({ consent_id: data.id, event: "confirmed", consent_version: siteConfig.consentVersion, source: "account_settings" });
    } else if (existing && existing.status !== "unsubscribed") {
      const { error } = await admin
        .from("marketing_consents")
        .update({ status: "unsubscribed", consent: false, withdrawn_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
      await admin.from("consent_events").insert({ consent_id: existing.id, event: "withdrawn", consent_version: existing.consent_version, source: "account_settings" });
    }
    revalidatePath("/account");
    return { ok: true, message: subscribe ? "You're subscribed." : "You're unsubscribed." };
  } catch (error) {
    logError("setMarketingConsent", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user?.profile) return { ok: false, message: "Sign in first." };
  if (formData.get("confirm_username") !== user.profile.username) {
    return { ok: false, message: "Type your username exactly to confirm." };
  }
  if (!hasServiceRole()) return { ok: false, message: "Account deletion is not available yet. Contact support." };

  const admin = createAdminClient();
  // Right to erasure: remove the marketing record too (cascades its audit events).
  await admin.from("marketing_consents").delete().eq("user_id", user.id);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    logError("deleteAccount", error);
    return { ok: false, message: "We couldn't delete your account. Please contact support." };
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?account=deleted");
}
