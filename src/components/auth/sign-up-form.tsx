"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { Checkbox, Field, FormMessage, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { LANGUAGES, PLATFORMS, REGIONS } from "@/config/options";
import { siteConfig } from "@/config/site";

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, initialActionState);
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state.message} />
      <Field label="Username" htmlFor="username" error={errors.username} hint="3–20 characters. Shown on your listings.">
        <Input id="username" name="username" autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" defaultValue={v.username} />
      </Field>
      <Field label="E-mail" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password} hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Platform" htmlFor="platform" error={errors.platform}>
          <Select id="platform" name="platform" defaultValue={v.platform ?? "ps5"}>
            {PLATFORMS.map((o) => <option key={o.value} value={o.value}>{o.short}</option>)}
          </Select>
        </Field>
        <Field label="Region" htmlFor="region" error={errors.region}>
          <Select id="region" name="region" defaultValue={v.region ?? "eu"}>
            {REGIONS.map((o) => <option key={o.value} value={o.value}>{o.short}</option>)}
          </Select>
        </Field>
        <Field label="Language" htmlFor="language" error={errors.language} className="col-span-2 sm:col-span-1">
          <Select id="language" name="language" defaultValue={v.language ?? "en"}>
            {LANGUAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <Checkbox name="marketing_opt_in" label={`${siteConfig.consentText} (optional)`} defaultChecked={v.marketing_opt_in === "on"} />
        <Checkbox
          name="accept_terms"
          required
          defaultChecked={v.accept_terms === "on"}
          label={
            <>
              I agree to the <Link href="/terms" className="text-fg underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-fg underline">Privacy Policy</Link>.
            </>
          }
        />
        {errors.accept_terms && <p className="text-sm text-danger" role="alert">{errors.accept_terms[0]}</p>}
      </div>
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
