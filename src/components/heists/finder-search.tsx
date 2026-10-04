"use client";

import { Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { IconSearch } from "@/components/ui/icons";
import { LANGUAGES, PLATFORMS, REGIONS } from "@/config/options";
import { track } from "@/lib/analytics/client";
import { EVENTS } from "@/lib/analytics/events";
import type { HeistType } from "@/data/heists";
import { HeistTypeOptions } from "./option-list";

/**
 * Hero search. A plain GET form to /find, so it works before hydration and
 * produces shareable URLs; JS only adds analytics.
 */
export function FinderSearch({ heistTypes }: { heistTypes: HeistType[] }) {
  return (
    <form
      action="/find"
      method="get"
      role="search"
      aria-label="Find GTA 6 heists"
      className="glass grid gap-3 rounded-2xl p-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end"
      onSubmit={(e) => {
        const data = new FormData(e.currentTarget);
        // Drop empty fields so URLs stay clean.
        for (const [key, value] of [...data.entries()]) {
          if (!value) e.currentTarget.querySelector<HTMLSelectElement>(`[name="${key}"]`)?.setAttribute("disabled", "");
        }
        track(EVENTS.searchPerformed, {
          source: "hero",
          filters: [...data.entries()].filter(([, v]) => v).map(([k]) => k).join(",") || "none",
        });
      }}
    >
      <SearchSelect label="Platform" name="platform">
        {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </SearchSelect>
      <SearchSelect label="Heist" name="heist">
        <HeistTypeOptions heistTypes={heistTypes} />
      </SearchSelect>
      <SearchSelect label="Region" name="region">
        {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </SearchSelect>
      <SearchSelect label="Language" name="language">
        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
      </SearchSelect>
      <SearchSelect label="Mic" name="mic">
        <option value="true">Mic required</option>
        <option value="false">No mic needed</option>
      </SearchSelect>
      <Button type="submit" size="lg" className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
        <IconSearch className="size-5" /> Find Heists
      </Button>
    </form>
  );
}

function SearchSelect({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  const id = `hero-${name}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="px-1 text-xs font-medium text-subtle">
        {label}
      </label>
      <Select id={id} name={name} defaultValue="">
        <option value="">Any</option>
        {children}
      </Select>
    </div>
  );
}
