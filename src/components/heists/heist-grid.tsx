import type { HeistListing } from "@/data/heists";
import { HeistCard } from "./heist-card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeistGrid({ listings }: { listings: HeistListing[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((h) => (
        <li key={h.id} className="animate-fade-in">
          <HeistCard heist={h} />
        </li>
      ))}
    </ul>
  );
}

export function HeistGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Skeleton className="h-[188px] rounded-[var(--radius-card)]" />
        </li>
      ))}
    </ul>
  );
}
