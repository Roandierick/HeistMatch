import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { LinkButton } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, category, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (
    <>
      <AdminTitle title="Blog posts">
        <LinkButton href="/admin/posts/new" size="sm">New post</LinkButton>
      </AdminTitle>
      <AdminTable head={["Title", "Status", "Category", "Published", "Updated"]} empty={!posts?.length}>
        {posts?.map((p) => (
          <tr key={p.id}>
            <Td>
              <Link href={`/admin/posts/${p.id}`} className="text-fg hover:text-accent">{p.title}</Link>
              <div className="text-xs text-subtle">/blog/{p.slug}</div>
            </Td>
            <Td>{p.status}</Td>
            <Td>{p.category}</Td>
            <Td className="whitespace-nowrap text-muted">{p.published_at ? formatDate(p.published_at) : "–"}</Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(p.updated_at)}</Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
