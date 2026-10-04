"use client";

import { useActionState } from "react";
import { requestPasswordReset, updatePassword } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialActionState);
  if (state.ok) return <FormMessage ok message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage ok={state.ok} message={state.message} />
      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm" error={state.fieldErrors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton pendingText="Saving…">Update password</SubmitButton>
    </form>
  );
}
