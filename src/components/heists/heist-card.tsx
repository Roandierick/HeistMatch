import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconClock, IconMic, IconStar } from "@/components/ui/icons";
import { LANGUAGES, PAYOUT_SPLITS, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS, labelOf } from "@/config/options";
import { formatDateTimeUtc, relativeTime } from "@/lib/format";
import { isStartingSoon } from "@/lib/filters";
import type { HeistListing } from "@/data/heists";
import { SlotPips } from "./slot-pips";

export function HeistCard({ heist, headingLevel = "h3" }: { heist: HeistListing; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const startsSoon = isStartingSoon(heist.start_at);
  const rating = heist.hostStats?.avg_rating;

  return (
    <article className="group relative flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-accent uppercase">
            {heist.heist_type_ref?.name ?? heist.heist_type}
          </p>
          <Heading className="mt-1 line-clamp-2 text-[1.02rem] leading-snug font-semibold text-fg">
            <Link href={`/heists/${heist.id}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus-visible:outline-none">
              {heist.title}
            </Link>
          </Heading>
        </div>
        <Badge tone={startsSoon ? "success" : "info"} className="shrink-0">
          {startsSoon ? "Starting now" : "Scheduled"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>{labelOf(PLATFORMS, heist.platform, true)}</Badge>
        <Badge>{labelOf(REGIONS, heist.region, true)}</Badge>
        <Badge>{labelOf(LANGUAGES, heist.language)}</Badge>
        <Badge>{labelOf(PLAYSTYLES, heist.playstyle)}</Badge>
        {heist.skill_level !== "any" && <Badge>{labelOf(SKILL_LEVELS, heist.skill_level)}</Badge>}
        {heist.mic_required && (
          <Badge tone="accent">
            <IconMic className="size-3.5" /> Mic
          </Badge>
        )}
        {heist.min_rank && <Badge>Rank {heist.min_rank}+</Badge>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3 text-sm">
        <div className="flex flex-col gap-1.5">
          <SlotPips needed={heist.players_needed} joined={heist.players_joined} />
          <span className="flex items-center gap-1.5 text-muted">
            <IconClock className="size-4" />
            <time dateTime={heist.start_at} title={formatDateTimeUtc(heist.start_at)}>
              {startsSoon ? "Now" : relativeTime(heist.start_at)}
            </time>
            {heist.payout_split && <span className="text-subtle">· {labelOf(PAYOUT_SPLITS, heist.payout_split)}</span>}
          </span>
        </div>
        <div className="text-right">
          <p className="max-w-32 truncate text-fg">{heist.host?.username ?? "Unknown"}</p>
          <p className="flex items-center justify-end gap-1 text-xs text-subtle">
            {rating ? (
              <>
                <IconStar className="size-3.5 text-accent" /> {Number(rating).toFixed(1)} ({heist.hostStats?.review_count})
              </>
            ) : (
              "New host"
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
