import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { HeistGridSkeleton } from "@/components/heists/heist-grid";

export default function Loading() {
  return (
    <Container className="pt-8 pb-12">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-9 w-80 max-w-full" />
      <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="hidden flex-col gap-4 md:flex">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <HeistGridSkeleton />
      </div>
    </Container>
  );
}
