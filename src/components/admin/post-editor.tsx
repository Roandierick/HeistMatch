"use client";

import { useActionState, useState } from "react";
import { adminSavePost } from "@/actions/admin";
import { initialActionState } from "@/lib/action-result";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { BLOG_CATEGORIES } from "@/config/blog";
import type { Tables } from "@/types/database";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function toLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostEditor({ post }: { post?: Tables<"blog_posts"> }) {
  const [state, action] = useActionState(adminSavePost, initialActionState);
  const e = state.fieldErrors ?? {};
  const v = state.values;
  const [title, setTitle] = useState(v?.title ?? post?.title ?? "");
  const [slug, setSlug] = useState(v?.slug ?? post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [publishLocal, setPublishLocal] = useState(toLocal(post?.published_at));
  const [seoTitle, setSeoTitle] = useState(v?.seo_title ?? post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(v?.seo_description ?? post?.seo_description ?? "");

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="post_id" value={post?.id ?? ""} />
      <input type="hidden" name="published_at" value={publishLocal ? new Date(publishLocal).toISOString() : ""} />
      <FormMessage ok={state.ok} message={state.message} />

      <Field label="Title (H1)" htmlFor="title" error={e.title}>
        <Input
          id="title"
          name="title"
          value={title}
          maxLength={120}
          required
          onChange={(ev) => {
            setTitle(ev.target.value);
            if (!slugTouched) setSlug(slugify(ev.target.value));
          }}
        />
      </Field>
      <Field label="Slug" htmlFor="slug" error={e.slug} hint={`/blog/${slug || "your-slug"}. Changing a published slug breaks links: add a redirect.`}>
        <Input id="slug" name="slug" value={slug} onChange={(ev) => { setSlug(ev.target.value); setSlugTouched(true); }} required />
      </Field>
      <Field label="Excerpt" htmlFor="excerpt" error={e.excerpt} hint="20–300 characters. Shown on cards and as fallback meta description.">
        <Textarea id="excerpt" name="excerpt" defaultValue={v?.excerpt ?? post?.excerpt} maxLength={300} className="min-h-20" required />
      </Field>
      <Field
        label="Content (Markdown)"
        htmlFor="content"
        error={e.content}
        hint="Use ## and ### headings (they build the table of contents). Link to /find or /create where relevant. Label unconfirmed GTA 6 information clearly."
      >
        <Textarea id="content" name="content" defaultValue={v?.content ?? post?.content} className="min-h-[420px] font-mono text-sm" required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={e.category}>
          <Select id="category" name="category" defaultValue={v?.category ?? post?.category ?? "news"}>
            {BLOG_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Tags" htmlFor="tags" error={e.tags} hint="Comma separated, max 10.">
          <Input id="tags" name="tags" defaultValue={v?.tags ?? post?.tags.join(", ")} />
        </Field>
        <Field label={`SEO title (${seoTitle.length}/70)`} htmlFor="seo_title" error={e.seo_title} optional hint="Defaults to the title.">
          <Input id="seo_title" name="seo_title" value={seoTitle} onChange={(ev) => setSeoTitle(ev.target.value)} maxLength={70} />
        </Field>
        <Field label={`Meta description (${seoDescription.length}/170)`} htmlFor="seo_description" error={e.seo_description} optional hint="Defaults to the excerpt.">
          <Input id="seo_description" name="seo_description" value={seoDescription} onChange={(ev) => setSeoDescription(ev.target.value)} maxLength={170} />
        </Field>
        <Field label="Featured image URL" htmlFor="featured_image" error={e.featured_image} optional hint="https:// URL (Supabase Storage recommended) or /path. Use only images you have rights to.">
          <Input id="featured_image" name="featured_image" defaultValue={v?.featured_image ?? post?.featured_image ?? ""} />
        </Field>
        <Field label="Image alt text" htmlFor="featured_image_alt" error={e.featured_image_alt} optional>
          <Input id="featured_image_alt" name="featured_image_alt" defaultValue={v?.featured_image_alt ?? post?.featured_image_alt ?? ""} maxLength={200} />
        </Field>
        <Field label="Author" htmlFor="author_name" error={e.author_name}>
          <Input id="author_name" name="author_name" defaultValue={v?.author_name ?? post?.author_name ?? "HeistMatch Editorial"} />
        </Field>
        <Field label="Publish date" htmlFor="publish_local" error={e.published_at} optional hint="Leave empty to publish now. A future date schedules the post.">
          <Input id="publish_local" type="datetime-local" value={publishLocal} onChange={(ev) => setPublishLocal(ev.target.value)} />
        </Field>
        <Field label="Status" htmlFor="status" error={e.status}>
          <Select id="status" name="status" defaultValue={v?.status ?? post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <div className="flex items-end pb-2">
          <Checkbox name="is_featured" label="Featured on the blog homepage" defaultChecked={v ? v.is_featured === "on" : post?.is_featured} />
        </div>
      </div>

      <SubmitButton className="self-start" pendingText="Saving…">Save post</SubmitButton>
    </form>
  );
}
