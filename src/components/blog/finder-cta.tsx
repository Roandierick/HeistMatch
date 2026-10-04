import { TrackLink } from "@/components/analytics/track-link";
import { buttonClasses } from "@/components/ui/button";
import { EVENTS } from "@/lib/analytics/events";

/** Content → product bridge. Every article carries this. */
export function FinderCta({ slug, variant = "inline" }: { slug: string; variant?: "inline" | "sidebar" }) {
  return (
    <aside
      aria-label="Find heist players"
      className={variant === "sidebar" ? "rounded-[var(--radius-card)] border border-accent/25 bg-accent/5 p-4" : "glass hero-glow rounded-2xl p-6"}
    >
      <p className={variant === "sidebar" ? "font-semibold text-fg" : "text-xl font-semibold text-fg"}>Find GTA 6 heist players</p>
      <p className="mt-1 text-sm text-muted">Stop playing with randoms. Filter by platform, region, language and mic, and join a crew that fits.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <TrackLink href="/find" event={EVENTS.blogCtaClicked} eventProps={{ slug, target: "find", placement: variant }} className={buttonClasses("primary", "sm")}>
          Find Heists
        </TrackLink>
        {variant === "inline" && (
          <TrackLink href="/create" event={EVENTS.blogCtaClicked} eventProps={{ slug, target: "create", placement: variant }} className={buttonClasses("secondary", "sm")}>
            Create Heist
          </TrackLink>
        )}
      </div>
    </aside>
  );
}
