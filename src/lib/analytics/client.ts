"use client";

import type { EventName } from "./events";

type Props = Record<string, string | number | boolean | null>;

function sessionId(): string | undefined {
  try {
    let id = sessionStorage.getItem("hm_sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("hm_sid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Cookie-less first-party tracking. Respects Do Not Track / Global Privacy Control. */
export function track(name: EventName, props?: Props) {
  if (typeof window === "undefined") return;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
  const body = JSON.stringify({
    name,
    path: location.pathname,
    referrer: document.referrer || undefined,
    session_id: sessionId(),
    props,
  });
  try {
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
    }
  } catch {
    // ignore
  }
}
