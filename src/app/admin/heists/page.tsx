import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { ActionButtonForm } from "@/components/heists/action-form";
import { adminRemoveHeist } from "@/actions/admin";
import { HEIST_STATUS_LABELS } from "@/config/options";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHeists() {
  const supabase = await createClient();
  const { data: heists } = await supabase
    .from("heists")
    .select("id, title, status, platform, region, created_at, players_joined, players_needed, host:profiles!heists_host_user_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <AdminTitle title="Listings" />
      <AdminTable head={["Title", "Host", "Status", "Crew", "Created", ""]} empty={!heists?.length}>
        {heists?.map((h) => (
          <tr key={h.id}>
            <Td><Link href={`/heists/${h.id}`} className="text-fg hover:text-accent">{h.title}</Link><div className="text-xs text-subtle">{h.platform} · {h.region}</div></Td>
            <Td>{h.host?.username}</Td>
            <Td>{HEIST_STATUS_LABELS[h.status] ?? h.status}</Td>
            <Td>{h.players_joined}/{h.players_needed}</Td>
            <Td className="whitespace-nowrap text-muted">{relativeTime(h.created_at)}</Td>
            <Td>
              {h.status !== "removed" && (
                <ActionButtonForm action={adminRemoveHeist} hidden={{ heist_id: h.id }} variant="danger" confirmText="Remove this listing?">
                  Remove
                </ActionButtonForm>
              )}
            </Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
