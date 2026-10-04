import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNewsletter() {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [confirmed, pending, unsubscribed, { data: rows }] = await Promise.all([
    supabase.from("marketing_consents").select("id", head).eq("status", "confirmed"),
    supabase.from("marketing_consents").select("id", head).eq("status", "pending"),
    supabase.from("marketing_consents").select("id", head).eq("status", "unsubscribed"),
    supabase.from("marketing_consents").select("id, email, status, source, consent_version, created_at, confirmed_at").order("created_at", { ascending: false }).limit(200),
  ]);

  return (
    <>
      <AdminTitle title="Newsletter">
        <a href="/admin/newsletter/export" className="text-sm text-accent hover:text-accent-strong">Export confirmed (CSV)</a>
      </AdminTitle>
      <dl className="mb-6 grid grid-cols-3 gap-3">
        {[["Confirmed", confirmed.count], ["Pending", pending.count], ["Unsubscribed", unsubscribed.count]].map(([label, value]) => (
          <div key={label as string} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <dt className="text-xs text-subtle">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value ?? 0}</dd>
          </div>
        ))}
      </dl>
      <AdminTable head={["E-mail", "Status", "Source", "Version", "Created", "Confirmed"]} empty={!rows?.length}>
        {rows?.map((r) => (
          <tr key={r.id}>
            <Td>{r.email}</Td>
            <Td>{r.status}</Td>
            <Td>{r.source}</Td>
            <Td className="text-muted">{r.consent_version}</Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(r.created_at)}</Td>
            <Td className="whitespace-nowrap text-muted">{r.confirmed_at ? formatDate(r.confirmed_at) : "–"}</Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
