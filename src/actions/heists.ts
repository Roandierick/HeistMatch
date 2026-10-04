"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { createHeistSchema, heistIdSchema, reviewSchema } from "@/lib/validation/heist";
import { reportSchema } from "@/lib/validation/misc";
import { formToObject, validationFailure } from "@/lib/validation/form";
import { friendlyDbError, logError } from "@/lib/errors";
import { withValues, type ActionState } from "@/lib/action-result";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

function revalidateListings(heistId?: string) {
  revalidatePath("/");
  revalidatePath("/find");
  if (heistId) revalidatePath(`/heists/${heistId}`);
}

export async function createHeist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to create a heist." };
  if (!user.emailVerified) return { ok: false, message: "Verify your e-mail address before creating a heist." };

  const parsed = createHeistSchema.safeParse(formToObject(formData));
  if (!parsed.success) return withValues(validationFailure(parsed.error), formData);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heists")
    .insert({ ...parsed.data, host_user_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.code !== "P0001") logError("createHeist", error);
    return withValues({ ok: false, message: friendlyDbError(error) }, formData);
  }

  await trackServer(EVENTS.heistCreated, {
    userId: user.id,
    props: { heist_type: parsed.data.heist_type, platform: parsed.data.platform, region: parsed.data.region },
  });
  revalidateListings();
  redirect(`/heists/${data.id}?created=1`);
}

export async function joinHeist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = heistIdSchema.safeParse(formData.get("heist_id"));
  if (!id.success) return { ok: false, message: "Invalid listing." };
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/heists/${id.data}`)}`);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_heist", { p_heist_id: id.data });
  if (error) return { ok: false, message: friendlyDbError(error) };

  await trackServer(EVENTS.heistJoined, { userId: user.id, props: { heist_id: id.data } });
  revalidateListings(id.data);
  return { ok: true, message: data === "already_joined" ? "You're already in this crew." : "You're in! Add your crew below." };
}

export async function leaveHeist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = heistIdSchema.safeParse(formData.get("heist_id"));
  if (!id.success) return { ok: false, message: "Invalid listing." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_heist", { p_heist_id: id.data });
  if (error) return { ok: false, message: friendlyDbError(error) };
  revalidateListings(id.data);
  return { ok: true, message: "You left the crew." };
}

const HOST_STATUSES = ["in_progress", "completed", "cancelled"] as const;

export async function updateHeistStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = heistIdSchema.safeParse(formData.get("heist_id"));
  const status = formData.get("status");
  if (!id.success || !HOST_STATUSES.includes(status as (typeof HOST_STATUSES)[number])) {
    return { ok: false, message: "Invalid request." };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };

  const supabase = await createClient();
  // RLS limits this to the host's own listing; the trigger guards transitions.
  const { data, error } = await supabase
    .from("heists")
    .update({ status: status as string })
    .eq("id", id.data)
    .eq("host_user_id", user.id)
    .select("id");
  if (error) return { ok: false, message: friendlyDbError(error) };
  if (!data?.length) return { ok: false, message: "Only the host can do that." };
  revalidateListings(id.data);
  return { ok: true, message: "Listing updated." };
}

export async function submitReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to report." };
  const parsed = reportSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { target_type, target_id, reason, details } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_user_id: user.id,
    target_type,
    heist_id: target_type === "heist" ? target_id : null,
    reported_user_id: target_type === "user" ? target_id : null,
    reason,
    details: details ?? null,
  });
  if (error) {
    logError("submitReport", error);
    return { ok: false, message: friendlyDbError(error) };
  }
  await trackServer(EVENTS.reportSubmitted, { userId: user.id, props: { target_type, reason } });
  return { ok: true, message: "Thanks. Our moderators will review this report." };
}

export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in first." };
  const parsed = reviewSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, "Choose whether you'd play with them again.");

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    reviewer_user_id: user.id,
    reviewed_user_id: parsed.data.reviewed_user_id,
    heist_id: parsed.data.heist_id,
    play_again: parsed.data.play_again,
    rating: parsed.data.rating ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: true, message: "You already rated this player for this heist." };
    return { ok: false, message: friendlyDbError(error) };
  }
  revalidatePath(`/heists/${parsed.data.heist_id}`);
  return { ok: true, message: "Thanks for the feedback." };
}
