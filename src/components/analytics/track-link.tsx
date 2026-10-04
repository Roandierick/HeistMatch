"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/client";
import type { EventName } from "@/lib/analytics/events";

/** A Link that records a first-party event on click (e.g. blog → finder CTR). */
export function TrackLink({
  event,
  eventProps,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { event: EventName; eventProps?: Record<string, string | number | boolean | null> }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
    />
  );
}
