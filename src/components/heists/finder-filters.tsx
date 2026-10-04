"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Select } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import { IconFilter, IconPlus, IconX } from "@/components/ui/icons";
import { LANGUAGES, MAX_PLAYERS_NEEDED, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS } from "@/config/options";
import { FILTER_KEYS, filtersToSearchParams, type HeistFilters } from "@/lib/filters";
import { track } from "@/lib/analytics/client";
import { EVENTS } from "@/lib/analytics/events";
import type { HeistType } from "@/data/heists";
import { HeistTypeOptions } from "./option-list";

type FilterValues = Partial<Record<(typeof FILTER_KEYS)[number] | "sort", string>>;

function toValues(filters: HeistFilters): FilterValues {
  const out: FilterValues = {};
  for (const key of FILTER_KEYS) if (filters[key] !== undefined) out[key] = String(filters[key]);
  out.sort = filters.sort;
  return out;
}

/**
 * Finder filters. A real GET form (works without JS); with JS, every change
 * updates the URL instantly so results are shareable and back/forward works.
 */
export function FinderFilters({
  filters,
  heistTypes,
  activeCount,
}: {
  filters: HeistFilters;
  heistTypes: HeistType[];
  activeCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const values = toValues(filters);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function apply(form: HTMLFormElement, changed?: string) {
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const next: Partial<HeistFilters> = {};
    for (const key of FILTER_KEYS) if (data[key]) (next as Record<string, string>)[key] = data[key];
    if (data.sort === "newest") next.sort = "newest";
    const qs = filtersToSearchParams(next).toString();
    if (changed) track(EVENTS.filterApplied, { filter: changed, value: data[changed] || "any" });
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const renderForm = (prefix: string) => (
    <form
      action="/find"
      method="get"
      aria-label="Filter heists"
      className="flex flex-col gap-4"
      onChange={(e) => apply(e.currentTarget, ((e.target as EventTarget) as HTMLSelectElement).name)}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
        setOpen(false);
      }}
    >
      <FilterSelect prefix={prefix} label="Platform" name="platform" value={values.platform}>
        {PLATFORMS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Heist" name="heist" value={values.heist}>
        <HeistTypeOptions heistTypes={heistTypes} />
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Region" name="region" value={values.region}>
        {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Language" name="language" value={values.language}>
        {LANGUAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Microphone" name="mic" value={values.mic}>
        <option value="true">Mic required</option>
        <option value="false">No mic needed</option>
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Skill level" name="skill" value={values.skill}>
        {SKILL_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Playstyle" name="playstyle" value={values.playstyle}>
        {PLAYSTYLES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Start" name="when" value={values.when}>
        <option value="now">Start now</option>
        <option value="scheduled">Scheduled</option>
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Open slots" name="slots" value={values.slots} anyLabel="Any">
        {Array.from({ length: MAX_PLAYERS_NEEDED }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}+ open</option>
        ))}
      </FilterSelect>
      <FilterSelect prefix={prefix} label="Sort" name="sort" value={values.sort} anyLabel={null}>
        <option value="soonest">Starting soonest</option>
        <option value="newest">Newest first</option>
      </FilterSelect>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1 md:hidden">
          Show results
        </Button>
        <noscript>
          <button type="submit" className="h-11 rounded-lg bg-accent px-4 font-medium text-accent-ink">Apply</button>
        </noscript>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              track(EVENTS.filterApplied, { filter: "reset", value: "all" });
              startTransition(() => router.replace(pathname, { scroll: false }));
              setOpen(false);
            }}
          >
            Reset filters
          </Button>
        )}
      </div>
    </form>
  );

  return (
    <>
      <div className="hidden md:block" aria-busy={pending}>
        {/* key re-mounts uncontrolled selects when the URL changes (e.g. back button) */}
        <div key={JSON.stringify(values)}>{renderForm("filter")}</div>
      </div>

      {/* Mobile: sticky bottom bar with filters + primary action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-filters">
            <IconFilter className="size-4" /> Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
          <LinkButton href="/create" className="flex-1">
            <IconPlus className="size-4" /> Create Heist
          </LinkButton>
        </div>
      </div>

      {open && (
        <div id="mobile-filters" role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-fade-in overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold">Filters</p>
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-2" aria-label="Close filters">
                <IconX className="size-5" />
              </button>
            </div>
            <div key={JSON.stringify(values)}>{renderForm("mfilter")}</div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  prefix,
  label,
  name,
  value,
  children,
  anyLabel = "Any",
}: {
  prefix: string;
  label: string;
  name: string;
  value?: string;
  children: React.ReactNode;
  anyLabel?: string | null;
}) {
  const id = `${prefix}-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-subtle uppercase">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value ?? ""}>
        {anyLabel !== null && <option value="">{anyLabel}</option>}
        {children}
      </Select>
    </div>
  );
}
