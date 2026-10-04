import { createClient } from "@/lib/supabase/server";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { EVENTS } from "@/lib/analytics/events";
import { isoDaysAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnalytics() {
  const supabase = await createClient();
  const since = isoDaysAgo(30).slice(0, 10);
  const [{ data: daily }, { data: pages }, { data: referrers }] = await Promise.all([
    supabase.from("analytics_daily").select("*").gte("day", since),
    supabase.from("analytics_top_pages").select("*"),
    supabase.from("analytics_referrers").select("*"),
  ]);

  const totals = new Map<string, { events: number }>();
  for (const row of daily ?? []) {
    const t = totals.get(row.name) ?? { events: 0 };
    t.events += row.events;
    totals.set(row.name, t);
  }
  const get = (name: string) => totals.get(name)?.events ?? 0;
  const views = get(EVENTS.pageView);
  const funnel = [
    ["Page views", views],
    ["Searches", get(EVENTS.searchPerformed)],
    ["Filter changes", get(EVENTS.filterApplied)],
    ["Blog → finder clicks", get(EVENTS.blogCtaClicked)],
    ["Sign-ups", get(EVENTS.signupCompleted)],
    ["E-mails verified", get(EVENTS.emailVerified)],
    ["Heists created", get(EVENTS.heistCreated)],
    ["Join clicks", get(EVENTS.heistJoinClicked)],
    ["Joins", get(EVENTS.heistJoined)],
    ["Newsletter sign-ups", get(EVENTS.newsletterSubscribed)],
    ["Newsletter confirmed", get(EVENTS.newsletterConfirmed)],
  ] as const;

  return (
    <>
      <AdminTitle title="Analytics (last 30 days)" />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {funnel.map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <dt className="text-xs text-subtle">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value.toLocaleString("en")}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Top pages</h2>
          <AdminTable head={["Path", "Views", "Sessions", "From external"]} empty={!pages?.length}>
            {pages?.map((p) => (
              <tr key={p.path ?? "unknown"}>
                <Td className="max-w-xs truncate">{p.path}</Td>
                <Td>{p.views}</Td>
                <Td>{p.sessions}</Td>
                <Td>{p.external_referrals}</Td>
              </tr>
            ))}
          </AdminTable>
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Referrers</h2>
          <AdminTable head={["Source", "Visits"]} empty={!referrers?.length}>
            {referrers?.map((r) => (
              <tr key={r.referrer_host}>
                <Td>{r.referrer_host}</Td>
                <Td>{r.visits}</Td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </div>
      <p className="mt-6 text-xs text-subtle">First-party, cookie-less events. Use Google Search Console for impressions, clicks and rankings.</p>
    </>
  );
}
