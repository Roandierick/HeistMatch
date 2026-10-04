import type { ReactNode } from "react";
import { cn } from "./cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      <p className="text-base font-semibold text-fg">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
