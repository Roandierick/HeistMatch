"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/account";
import { initialActionState } from "@/lib/action-result";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { LANGUAGES, PLATFORMS, REGIONS } from "@/config/options";

type Initial = {
  username: string;
  platform: string;
  region: string;
  primary_language: string;
  bio: string;
  platform_handle: string;
  discord_handle: string;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action] = useActionState(updateProfile, initialActionState);
  const e = state.fieldErrors ?? {};
  const v = { ...initial, ...(state.values ?? {}) };
  return (
    <form action={action} className="flex flex-col gap-5">
      <FormMessage ok={state.ok} message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Username" htmlFor="username" error={e.username} className="sm:col-span-2">
          <Input id="username" name="username" defaultValue={v.username} required pattern="[A-Za-z0-9_]{3,20}" maxLength={20} />
        </Field>
        <Field label="Platform" htmlFor="platform" error={e.platform}>
          <Select id="platform" name="platform" defaultValue={v.platform}>
            {PLATFORMS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Region" htmlFor="region" error={e.region}>
          <Select id="region" name="region" defaultValue={v.region}>
            {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Language" htmlFor="primary_language" error={e.primary_language}>
          <Select id="primary_language" name="primary_language" defaultValue={v.primary_language}>
            {LANGUAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Gamertag / PSN ID" htmlFor="platform_handle" error={e.platform_handle} optional hint="Only shared with your crew.">
          <Input id="platform_handle" name="platform_handle" defaultValue={v.platform_handle} maxLength={32} autoComplete="off" />
        </Field>
        <Field label="Discord" htmlFor="discord_handle" error={e.discord_handle} optional hint="Only shared with your crew.">
          <Input id="discord_handle" name="discord_handle" defaultValue={v.discord_handle} maxLength={37} autoComplete="off" />
        </Field>
        <Field label="Bio" htmlFor="bio" error={e.bio} optional className="sm:col-span-2">
          <Textarea id="bio" name="bio" defaultValue={v.bio} maxLength={280} className="min-h-20" />
        </Field>
      </div>
      <SubmitButton className="self-start" pendingText="Saving…">Save profile</SubmitButton>
    </form>
  );
}
