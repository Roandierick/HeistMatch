import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminTitle } from "@/components/admin/table";
import { Card } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form";
import { PostEditor } from "@/components/admin/post-editor";
import { ActionButtonForm } from "@/components/heists/action-form";
import { adminDeletePost } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  return (
    <>
      <AdminTitle title="Edit post">
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} className="text-sm text-accent hover:text-accent-strong">View live ↗</Link>
        )}
      </AdminTitle>
      {saved === "1" && <div className="mb-4"><FormMessage ok message="Post created." /></div>}
      <Card className="p-5 sm:p-6">
        <PostEditor key={post.updated_at} post={post} />
      </Card>
      <div className="mt-6 max-w-xs">
        <ActionButtonForm action={adminDeletePost} hidden={{ post_id: post.id }} variant="danger" confirmText="Delete this post permanently?">
          Delete post
        </ActionButtonForm>
      </div>
    </>
  );
}
