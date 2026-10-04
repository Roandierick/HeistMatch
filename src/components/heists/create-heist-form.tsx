"use client";

import { useActionState, useState } from "react";
import { createHeist } from "@/actions/heists";
import { initialActionState } from "@/lib/action-result";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/components/ui/cn";
import {
  LANGUAGES, MAX_PLAYERS_NEEDED, PAYOUT_SPLITS, PLATFORMS, PLAYSTYLES, REGIONS, SKILL_LEVELS,
} from "@/config/options";
import type { HeistType } from "@/data/heists";
import { HeistTypeOptions } from "./option-list";

type Defaults = { platform: string; region: string; language: string };

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateHeistForm({ heistTypes, defaults }: { heistTypes: HeistType[]; defaults: Defaults }) {
  const [state, action] = useActionState(createHeist, initialActionState);
  const [startMode, setStartMode] = useState<"now" | "scheduled">("now");
  const [localStart, setLocalStart] = useState("");
  const [description, setDescription] = useState("");
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  // datetime-local has no timezone; convert in the browser so the server stores the right instant.
  const startIso = localStart ? new Date(localStart).toISOString() : "";
  const now = new Date();
  const max = new Date(now.getTime() + 14 * 24 * 3600_000);

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      <FormMessage ok={state.ok} message={state.message} />

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold tracking-wide text-subtle uppercase">The job</legend>
        <Field label="Heist" htmlFor="heist_type" error={errors.heist_type} className="sm:col-span-2">
          <Select id="heist_type" name="heist_type" required defaultValue={v.heist_type ?? ""} aria-invalid={!!errors.heist_type}>
            <option value="" disabled>Choose a heist</option>
            <HeistTypeOptions heistTypes={heistTypes} />
          </Select>
        </Field>
        <Field label="Listing title" htmlFor="title" error={errors.title} hint="Short and specific, e.g. “Cayo elite challenge, fast runs”." className="sm:col-span-2">
          <Input id="title" name="title" defaultValue={v.title} required minLength={4} maxLength={80} autoComplete="off" aria-invalid={!!errors.title} />
        </Field>
        <Field label="Platform" htmlFor="platform" error={errors.platform}>
          <Select id="platform" name="platform" defaultValue={v.platform ?? defaults.platform}>
            {PLATFORMS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Region" htmlFor="region" error={errors.region}>
          <Select id="region" name="region" defaultValue={v.region ?? defaults.region}>
            {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Language" htmlFor="language" error={errors.language}>
          <Select id="language" name="language" defaultValue={v.language ?? defaults.language}>
            {LANGUAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Players needed" htmlFor="players_needed" error={errors.players_needed} hint="Not counting yourself.">
          <Select id="players_needed" name="players_needed" defaultValue={v.players_needed ?? "3"}>
            {Array.from({ length: MAX_PLAYERS_NEEDED }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "player" : "players"}</option>
            ))}
          </Select>
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold tracking-wide text-subtle uppercase">Your crew</legend>
        <Field label="Preferred skill level" htmlFor="skill_level" error={errors.skill_level}>
          <Select id="skill_level" name="skill_level" defaultValue={v.skill_level ?? "any"}>
            {SKILL_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Playstyle" htmlFor="playstyle" error={errors.playstyle}>
          <Select id="playstyle" name="playstyle" defaultValue={v.playstyle ?? "normal"}>
            {PLAYSTYLES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Payout split" htmlFor="payout_split" error={errors.payout_split} optional>
          <Select id="payout_split" name="payout_split" defaultValue={v.payout_split ?? ""}>
            <option value="">Not specified</option>
            {PAYOUT_SPLITS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Minimum rank" htmlFor="min_rank" error={errors.min_rank} optional>
          <Input id="min_rank" name="min_rank" type="number" inputMode="numeric" min={1} max={8000} placeholder="e.g. 50" defaultValue={v.min_rank} />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox name="mic_required" label="Microphone required" defaultChecked={v.mic_required === "on"} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-sm font-semibold tracking-wide text-subtle uppercase">When</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Start time">
          {(["now", "scheduled"] as const).map((mode) => (
            <label
              key={mode}
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors",
                startMode === mode ? "border-accent/60 bg-accent/5" : "border-line hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="start_mode"
                value={mode}
                checked={startMode === mode}
                onChange={() => setStartMode(mode)}
                className="sr-only"
              />
              <span className="font-medium text-fg">{mode === "now" ? "Start now" : "Schedule"}</span>
              <span className="text-sm text-muted">{mode === "now" ? "Ready to play right away" : "Pick a time up to 14 days ahead"}</span>
            </label>
          ))}
        </div>
        {startMode === "scheduled" && (
          <Field label="Start time (your local time)" htmlFor="start_local" error={errors.start_at}>
            <Input
              id="start_local"
              type="datetime-local"
              value={localStart}
              min={toLocalInputValue(now)}
              max={toLocalInputValue(max)}
              onChange={(e) => setLocalStart(e.target.value)}
              aria-invalid={!!errors.start_at}
            />
          </Field>
        )}
        <input type="hidden" name="start_at" value={startMode === "scheduled" ? startIso : ""} />
      </fieldset>

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description}
        optional
        hint={`${description.length}/600 · Roles, setup progress, what you expect. No links or contact details: those are shared with your crew after they join.`}
      >
        <Textarea id="description" name="description" maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle">Listings close automatically 3 hours after the start time. Max 2 active listings.</p>
        <SubmitButton size="lg" pendingText="Publishing…">Publish heist</SubmitButton>
      </div>
    </form>
  );
}
