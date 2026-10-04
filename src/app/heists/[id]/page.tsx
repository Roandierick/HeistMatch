import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { IconMic, IconStar } from "@/components/ui/icons";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SlotPips } from "@/components/heists/slot-pips";
import { JoinButton } from "@/components/heists/join-button";
import { HostControls, LeaveButton } from "@/components/heists/host-controls";
import { ReportForm } from "@/components/heists/report-form";
import { ReviewForm } from "@/components/heists/review-form";
import { getHeist } from "@/data/heists";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  HEIST_STATUS_LABELS, LANGUAGES, PAYOUT_SPLITS, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS, labelOf,
} from "@/config/options";
import { formatDateTimeUtc, isPast, relativeTime } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<"/heists/[id]">): Promise<Metadata> {
  const { id } = await params;
  const heist = UUID.test(id) ? await getHeist(id) : null;
  return pageMetadata({
    title: heist ? `${heist.title} · ${heist.heist_type_ref?.name ?? "Heist"}` : "Heist not found",
    description: heist
      ? `Join ${heist.host?.username ?? "this host"}'s ${heist.heist_type_ref?.name ?? "heist"} on ${labelOf(PLATFORMS, heist.platform)} (${labelOf(REGIONS, heist.region)}).`
      : "This heist listing does not exist.",
    path: `/heists/${id}`,
    // Listings are short-lived user-generated content: never indexed.
    noindex: true,
  });
}

export default async function HeistPage({ params, searchParams }: PageProps<"/heists/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [heist, user, query] = await Promise.all([getHeist(id), getCurrentUser(), searchParams]);
  if (!heist) notFound();

  const isHost = user?.id === heist.host_user_id;
  const isMember = !!user && heist.members.some((m) => m.user_id === user.id);
  const isParticipant = isHost || isMember;
  const expired = isPast(heist.expires_at);
  const joinable = heist.status === "open" && !expired;
  const started = isPast(heist.start_at);
  const closed = ["completed", "cancelled", "expired", "removed"].includes(heist.status) || expired;

  let contacts: { user_id: string; username: string; is_host: boolean; platform_handle: string | null; discord_handle: string | null }[] = [];
  let reviewedIds = new Set<string>();
  if (user && isParticipant) {
    const supabase = await createClient();
    const [{ data: crew }, { data: reviews }] = await Promise.all([
      supabase.rpc("get_heist_crew_contacts", { p_heist_id: id }),
      supabase.from("reviews").select("reviewed_user_id").eq("heist_id", id).eq("reviewer_user_id", user.id),
    ]);
    contacts = crew ?? [];
    reviewedIds = new Set((reviews ?? []).map((r) => r.reviewed_user_id));
  }

  const details: [string, string][] = [
    ["Platform", labelOf(PLATFORMS, heist.platform)],
    ["Region", labelOf(REGIONS, heist.region)],
    ["Language", labelOf(LANGUAGES, heist.language)],
    ["Skill level", labelOf(SKILL_LEVELS, heist.skill_level)],
    ["Playstyle", labelOf(PLAYSTYLES, heist.playstyle)],
    ["Payout split", heist.payout_split ? labelOf(PAYOUT_SPLITS, heist.payout_split) : "Not specified"],
    ["Minimum rank", heist.min_rank ? String(heist.min_rank) : "None"],
    ["Microphone", heist.mic_required ? "Required" : "Not required"],
  ];

  return (
    <Container className="max-w-5xl pt-8 pb-16">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Find Heists", path: "/find" },
          { name: heist.title, path: `/heists/${id}` },
        ]}
      />

      {query.created === "1" && isHost && (
        <div className="mt-6">
          <FormMessage ok message="Your heist is live in the finder. Share this page to fill your crew faster." />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{heist.heist_type_ref?.name ?? heist.heist_type}</Badge>
              <Badge tone={heist.status === "open" && !expired ? "success" : "neutral"}>
                {expired && heist.status === "open" ? "Expired" : HEIST_STATUS_LABELS[heist.status] ?? heist.status}
              </Badge>
              {heist.mic_required && (
                <Badge>
                  <IconMic className="size-3.5" /> Mic required
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{heist.title}</h1>
            <p className="mt-2 text-muted">
              Starts{" "}
              <time dateTime={heist.start_at} className="text-fg">
                {started ? "now" : relativeTime(heist.start_at)}
              </time>{" "}
              · {formatDateTimeUtc(heist.start_at)} · posted {relativeTime(heist.created_at)}
            </p>

            {heist.description && (
              <p className="mt-5 border-t border-line pt-5 leading-relaxed whitespace-pre-line text-fg/90">{heist.description}</p>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-4">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-subtle">{label}</dt>
                  <dd className="mt-0.5 text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {isParticipant && contacts.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Your crew</h2>
              <p className="mt-1 text-sm text-muted">Only visible to the host and joined players. Add each other in-game to start.</p>
              <ul className="mt-4 divide-y divide-line">
                {contacts.map((c) => (
                  <li key={c.user_id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-2">
                      <Link href={`/players/${c.username}`} className="font-medium text-fg hover:text-accent">{c.username}</Link>
                      {c.is_host && <Badge tone="accent">Host</Badge>}
                    </span>
                    <span className="text-sm text-muted">
                      {c.platform_handle ? `${labelOf(PLATFORMS, heist.platform, true)}: ${c.platform_handle}` : "No gamertag set"}
                      {c.discord_handle && ` · Discord: ${c.discord_handle}`}
                    </span>
                  </li>
                ))}
              </ul>
              {user && !contacts.find((c) => c.user_id === user.id)?.platform_handle && (
                <p className="mt-3 text-sm text-warning">
                  Add your gamertag in <Link href="/account" className="underline">account settings</Link> so your crew can find you.
                </p>
              )}
            </Card>
          )}

          {isParticipant && started && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Rate your crew</h2>
              <p className="mt-1 text-sm text-muted">Your feedback builds reputation and helps everyone find reliable players.</p>
              <ul className="mt-4 flex flex-col gap-5">
                {contacts
                  .filter((c) => c.user_id !== user?.id)
                  .map((c) => (
                    <li key={c.user_id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                      {reviewedIds.has(c.user_id) ? (
                        <p className="text-sm text-muted">You rated {c.username}. Thanks!</p>
                      ) : (
                        <ReviewForm heistId={id} userId={c.user_id} username={c.username} />
                      )}
                    </li>
                  ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <SlotPips needed={heist.players_needed} joined={heist.players_joined} />
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li className="flex items-center justify-between">
                <Link href={`/players/${heist.host?.username ?? ""}`} className="font-medium text-fg hover:text-accent">
                  {heist.host?.username ?? "Unknown host"}
                </Link>
                <span className="flex items-center gap-1 text-xs text-subtle">
                  Host
                  {heist.hostStats?.avg_rating ? (
                    <>
                      {" · "}
                      <IconStar className="size-3.5 text-accent" /> {Number(heist.hostStats.avg_rating).toFixed(1)}
                    </>
                  ) : null}
                </span>
              </li>
              {heist.members.map((m) => (
                <li key={m.user_id} className="text-muted">
                  {m.profile?.username ?? "Player"}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-2">
              {isHost ? (
                !closed && <HostControls heistId={id} status={heist.status} />
              ) : isMember ? (
                <>
                  <p className="text-sm text-success">You&apos;re in this crew.</p>
                  {!closed && <LeaveButton heistId={id} />}
                </>
              ) : joinable ? (
                user ? (
                  <JoinButton heistId={id} />
                ) : (
                  <LinkButton href={`/sign-in?next=/heists/${id}`} className="w-full">
                    Sign in to join
                  </LinkButton>
                )
              ) : (
                <p className="text-sm text-muted">This listing is not accepting players.</p>
              )}
              {!isHost && (
                <LinkButton href="/find" variant="ghost" className="w-full">
                  Browse other heists
                </LinkButton>
              )}
            </div>
          </Card>
          {user && !isHost && <ReportForm targetType="heist" targetId={id} label="Report this listing" />}
        </aside>
      </div>
    </Container>
  );
}
