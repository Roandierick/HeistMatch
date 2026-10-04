import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { ActionButtonForm } from "@/components/heists/action-form";
import { Input } from "@/components/ui/form";
import { adminSetBan } from "@/actions/admin";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsers({ searchParams }: PageProps<"/admin/users">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.replace(/[^A-Za-z0-9_]/g, "").slice(0, 20) : "";
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, username, platform, region, role, is_banned, created_at").order("created_at", { ascending: false }).limit(100);
  if (term) query = query.ilike("username", `%${term}%`);
  const { data: users } = await query;

  return (
    <>
      <AdminTitle title="Users">
        <form className="w-64">
          <label htmlFor="user-search" className="sr-only">Search username</label>
          <Input id="user-search" name="q" defaultValue={term} placeholder="Search username" />
        </form>
      </AdminTitle>
      <AdminTable head={["Username", "Platform", "Role", "Joined", ""]} empty={!users?.length}>
        {users?.map((u) => (
          <tr key={u.id}>
            <Td>
              <Link href={`/players/${u.username}`} className="text-fg hover:text-accent">{u.username}</Link>
              {u.is_banned && <span className="ml-2 text-xs text-danger">banned</span>}
            </Td>
            <Td>{u.platform} · {u.region}</Td>
            <Td>{u.role}</Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(u.created_at)}</Td>
            <Td>
              {u.role !== "admin" && (
                <ActionButtonForm
                  action={adminSetBan}
                  hidden={{ user_id: u.id, banned: u.is_banned ? "false" : "true" }}
                  variant={u.is_banned ? "secondary" : "danger"}
                  confirmText={u.is_banned ? undefined : `Ban ${u.username} and remove their listings?`}
                >
                  {u.is_banned ? "Unban" : "Ban"}
                </ActionButtonForm>
              )}
            </Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
