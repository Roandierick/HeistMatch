import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconStar } from "@/components/ui/icons";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ReportForm } from "@/components/heists/report-form";
import { getProfileByUsername, getRecentHeistsByHost } from "@/data/profiles";
import { HEIST_STATUS_LABELS, LANGUAGES, PLATFORMS, REGIONS, labelOf } from "@/config/options";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/players/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  return pageMetadata({
    title: profile ? `${profile.username} · GTA 6 player profile` : "Player not found",
    description: profile
      ? `${profile.username} plays on ${labelOf(PLATFORMS, profile.platform)} in ${labelOf(REGIONS, profile.region)}. See their heist history and reputation on HeistMatch.`
      : "This player does not exist.",
    path: `/players/${username}`,
    // Thin UGC for now: profiles become indexable once reputation data makes them unique.
    noindex: true,
  });
}

export default async function PlayerPage({ params }: PageProps<"/players/[username]">) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const heists = await getRecentHeistsByHost(profile.id);
  const s = profile.stats;

  const stats = [
    { label: "Completed heists", value: s?.completed_heists ?? 0 },
    { label: "Hosted", value: s?.hosted_heists ?? 0 },
    { label: "Rating", value: s?.avg_rating ? Number(s.avg_rating).toFixed(1) : "–" },
    { label: "Would play again", value: s?.play_again_pct != null ? `${s.play_again_pct}%` : "–" },
  ];

  return (
    <Container className="max-w-4xl pt-8 pb-16">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Players", path: "/find" }, { name: profile.username, path: `/players/${profile.username}` }]} />
      <Card className="mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-14 place-items-center rounded-xl bg-accent/15 text-lg font-semibold text-accent uppercase">
            {profile.username.slice(0, 2)}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{profile.username}</h1>
            <p className="text-sm text-muted">Joined {formatDate(profile.created_at)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge>{labelOf(PLATFORMS, profile.platform)}</Badge>
          <Badge>{labelOf(REGIONS, profile.region)}</Badge>
          <Badge>{labelOf(LANGUAGES, profile.primary_language)}</Badge>
          {profile.preferred_roles.map((r) => <Badge key={r}>{r}</Badge>)}
        </div>
        {profile.bio && <p className="mt-4 whitespace-pre-line text-fg/90">{profile.bio}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-lg border border-line bg-surface-2 p-3">
              <dt className="text-xs text-subtle">{st.label}</dt>
              <dd className="mt-1 flex items-center gap-1 text-xl font-semibold text-fg">
                {st.label === "Rating" && s?.avg_rating ? <IconStar className="size-4 text-accent" /> : null}
                {st.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-subtle">Based on {s?.review_count ?? 0} crew reviews.</p>
      </Card>

      <section aria-labelledby="hosted" className="mt-8">
        <h2 id="hosted" className="text-lg font-semibold">Recent heists</h2>
        {heists.length > 0 ? (
          <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
            {heists.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <Link href={`/heists/${h.id}`} className="truncate text-fg hover:text-accent">
                  {h.title} <span className="text-subtle">· {h.heist_type_ref?.name}</span>
                </Link>
                <span className="shrink-0 text-subtle">{HEIST_STATUS_LABELS[h.status] ?? h.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No heists hosted yet.</p>
        )}
      </section>

      <div className="mt-8">
        <ReportForm targetType="user" targetId={profile.id} label="Report this player" />
      </div>
    </Container>
  );
}
