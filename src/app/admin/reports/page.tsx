import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { ActionButtonForm } from "@/components/heists/action-form";
import { adminRemoveHeist, adminResolveReport, adminSetBan } from "@/actions/admin";
import { REPORT_REASONS, labelOf } from "@/config/options";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReports({ searchParams }: PageProps<"/admin/reports">) {
  const { status } = await searchParams;
  const filter = status === "resolved" || status === "dismissed" ? status : "open";
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      "id, target_type, heist_id, reported_user_id, reason, details, status, created_at, reporter:profiles!reports_reporter_user_id_fkey(username), reported:profiles!reports_reported_user_id_fkey(username), heist:heists(title, host_user_id)",
    )
    .eq("status", filter)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <AdminTitle title="Reports">
        <nav className="flex gap-2 text-sm">
          {["open", "resolved", "dismissed"].map((s) => (
            <Link key={s} href={`/admin/reports?status=${s}`} className={s === filter ? "text-fg" : "text-muted hover:text-fg"}>
              {s}
            </Link>
          ))}
        </nav>
      </AdminTitle>
      <AdminTable head={["Target", "Reason", "Reporter", "When", "Actions"]} empty={!reports?.length}>
        {reports?.map((r) => (
          <tr key={r.id}>
            <Td>
              {r.target_type === "heist" && r.heist_id ? (
                <Link href={`/heists/${r.heist_id}`} className="text-fg hover:text-accent">Listing: {r.heist?.title ?? r.heist_id}</Link>
              ) : (
                <Link href={`/players/${r.reported?.username ?? ""}`} className="text-fg hover:text-accent">Player: {r.reported?.username}</Link>
              )}
              {r.details && <p className="mt-1 max-w-sm text-xs whitespace-pre-line text-muted">{r.details}</p>}
            </Td>
            <Td>{labelOf(REPORT_REASONS, r.reason)}</Td>
            <Td>{r.reporter?.username}</Td>
            <Td className="whitespace-nowrap text-muted">{relativeTime(r.created_at)}</Td>
            <Td>
              {r.status === "open" && (
                <div className="flex flex-col gap-1.5">
                  {r.heist_id && (
                    <ActionButtonForm action={adminRemoveHeist} hidden={{ heist_id: r.heist_id }} variant="danger" confirmText="Remove this listing?">
                      Remove listing
                    </ActionButtonForm>
                  )}
                  {(r.reported_user_id || r.heist?.host_user_id) && (
                    <ActionButtonForm
                      action={adminSetBan}
                      hidden={{ user_id: (r.reported_user_id ?? r.heist?.host_user_id) as string, banned: "true" }}
                      variant="danger"
                      confirmText="Ban this user?"
                    >
                      Ban user
                    </ActionButtonForm>
                  )}
                  <ActionButtonForm action={adminResolveReport} hidden={{ report_id: r.id, status: "resolved" }} variant="secondary">
                    Resolve
                  </ActionButtonForm>
                  <ActionButtonForm action={adminResolveReport} hidden={{ report_id: r.id, status: "dismissed" }} variant="ghost">
                    Dismiss
                  </ActionButtonForm>
                </div>
              )}
            </Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
