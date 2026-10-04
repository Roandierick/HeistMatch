"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initialActionState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state.message} />
      <Field label="E-mail" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="-mt-1 text-right text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-fg">Forgot password?</Link>
      </div>
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
