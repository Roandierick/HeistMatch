"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import { EVENTS } from "@/lib/analytics/events";

export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track(EVENTS.pageView);
  }, [pathname]);
  return null;
}
