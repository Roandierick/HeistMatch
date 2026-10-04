"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";

type Me = { username: string; isAdmin: boolean } | null;

/**
 * Auth state is fetched client-side so every public page can stay
 * statically rendered and cached; only this small island is per-user.
 */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useState<Me | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user: Me } | null) => !cancelled && setMe(data?.user ?? null))
      .catch(() => !cancelled && setMe(null));
    return () => {
      cancelled = true;
    };
  }, []);

  if (me === undefined) return <div className="h-9 w-24" aria-hidden />;

  if (!me) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className={buttonClasses("ghost", "sm")}>
          Sign in
        </Link>
        {!compact && (
          <span className="hidden sm:block">
            <Link href="/sign-up" className={buttonClasses("secondary", "sm")}>
              Create account
            </Link>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {me.isAdmin && (
        <span className="hidden sm:block">
          <Link href="/admin" className={buttonClasses("ghost", "sm")}>
            Admin
          </Link>
        </span>
      )}
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 py-1 pr-3 pl-1 text-sm text-fg hover:border-line-strong"
        aria-label={`Your account (${me.username})`}
      >
        <span className="grid size-7 place-items-center rounded-md bg-accent/15 text-xs font-semibold text-accent uppercase">
          {me.username.slice(0, 2)}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{me.username}</span>
      </Link>
    </div>
  );
}
