import { createClient } from "@/lib/supabase/server";
import { AdminTitle } from "@/components/admin/table";
import { isoDaysAgo, nowIso } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();
  const now = nowIso();
  const weekAgo = isoDaysAgo(7);
  const head = { count: "exact" as const, head: true };
  const [openHeists, heistsWeek, users, usersWeek, reports, subscribers, posts] = await Promise.all([
    supabase.from("heists").select("id", head).eq("status", "open").gt("expires_at", now),
    supabase.from("heists").select("id", head).gt("created_at", weekAgo),
    supabase.from("profiles").select("id", head),
    supabase.from("profiles").select("id", head).gt("created_at", weekAgo),
    supabase.from("reports").select("id", head).eq("status", "open"),
    supabase.from("marketing_consents").select("id", head).eq("status", "confirmed"),
    supabase.from("blog_posts").select("id", head).eq("status", "published"),
  ]);

  const tiles = [
    { label: "Open listings", value: openHeists.count },
    { label: "Listings (7d)", value: heistsWeek.count },
    { label: "Accounts", value: users.count },
    { label: "New accounts (7d)", value: usersWeek.count },
    { label: "Open reports", value: reports.count, warn: (reports.count ?? 0) > 0 },
    { label: "Confirmed subscribers", value: subscribers.count },
    { label: "Published articles", value: posts.count },
  ];

  return (
    <>
      <AdminTitle title="Overview" />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <dt className="text-xs text-subtle">{t.label}</dt>
            <dd className={`mt-1 text-2xl font-semibold ${t.warn ? "text-warning" : "text-fg"}`}>{t.value ?? 0}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
