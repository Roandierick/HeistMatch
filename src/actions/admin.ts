"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validation/blog";
import { formToObject, validationFailure } from "@/lib/validation/form";
import { withValues, type ActionState } from "@/lib/action-result";
import { friendlyDbError, logError } from "@/lib/errors";

const id = z.uuid();

export async function adminRemoveHeist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const heistId = id.safeParse(formData.get("heist_id"));
  if (!heistId.success) return { ok: false, message: "Invalid id." };
  const supabase = await createClient();
  const { error } = await supabase.from("heists").update({ status: "removed" }).eq("id", heistId.data);
  if (error) return { ok: false, message: friendlyDbError(error) };
  revalidatePath("/");
  revalidatePath("/find");
  revalidatePath("/admin/heists");
  return { ok: true, message: "Listing removed." };
}

export async function adminSetBan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const userId = id.safeParse(formData.get("user_id"));
  if (!userId.success) return { ok: false, message: "Invalid id." };
  if (userId.data === admin.id) return { ok: false, message: "You can't ban yourself." };
  const banned = formData.get("banned") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_banned: banned }).eq("id", userId.data);
  if (error) return { ok: false, message: friendlyDbError(error) };
  if (banned) {
    // Take down their open listings immediately.
    await supabase.from("heists").update({ status: "removed" }).eq("host_user_id", userId.data).in("status", ["open", "full", "in_progress"]);
    revalidatePath("/find");
  }
  revalidatePath("/admin/users");
  return { ok: true, message: banned ? "User banned and listings removed." : "User unbanned." };
}

export async function adminResolveReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const reportId = id.safeParse(formData.get("report_id"));
  const status = formData.get("status");
  if (!reportId.success || (status !== "resolved" && status !== "dismissed")) return { ok: false, message: "Invalid request." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status, resolved_by: admin.id, resolved_at: new Date().toISOString() })
    .eq("id", reportId.data);
  if (error) return { ok: false, message: friendlyDbError(error) };
  revalidatePath("/admin/reports");
  return { ok: true, message: status === "resolved" ? "Marked as resolved." : "Dismissed." };
}

export async function adminSavePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const postId = formData.get("post_id");
  const parsed = blogPostSchema.safeParse(formToObject(formData));
  if (!parsed.success) return withValues(validationFailure(parsed.error), formData);

  const data = parsed.data;
  // Publishing without a date publishes now.
  const published_at = data.status === "published" ? (data.published_at ?? new Date().toISOString()) : data.published_at;
  const row = { ...data, published_at };
  const supabase = await createClient();

  let savedId: string | null = null;
  if (typeof postId === "string" && postId) {
    const { data: updated, error } = await supabase.from("blog_posts").update(row).eq("id", postId).select("id, slug").single();
    if (error) {
      logError("adminSavePost.update", error);
      return withValues({ ok: false, message: error.code === "23505" ? "That slug is already used." : friendlyDbError(error) }, formData);
    }
    savedId = updated.id;
  } else {
    const { data: inserted, error } = await supabase
      .from("blog_posts")
      .insert({ ...row, author_id: admin.id })
      .select("id")
      .single();
    if (error) {
      logError("adminSavePost.insert", error);
      return withValues({ ok: false, message: error.code === "23505" ? "That slug is already used." : friendlyDbError(error) }, formData);
    }
    savedId = inserted.id;
  }

  revalidatePath("/blog", "layout");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/posts");
  if (typeof postId !== "string" || !postId) redirect(`/admin/posts/${savedId}?saved=1`);
  return { ok: true, message: "Saved." };
}

export async function adminDeletePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const postId = id.safeParse(formData.get("post_id"));
  if (!postId.success) return { ok: false, message: "Invalid id." };
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId.data);
  if (error) return { ok: false, message: friendlyDbError(error) };
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
  redirect("/admin/posts");
}
