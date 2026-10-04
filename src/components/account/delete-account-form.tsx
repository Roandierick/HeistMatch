"use client";

import { useActionState } from "react";
import { deleteAccount } from "@/actions/account";
import { initialActionState } from "@/lib/action-result";
import { Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function DeleteAccountForm({ username }: { username: string }) {
  const [state, action] = useActionState(deleteAccount, initialActionState);
  return (
    <details>
      <summary className="cursor-pointer text-sm text-danger">Delete my account</summary>
      <form action={action} className="mt-4 flex flex-col gap-3">
        <p className="text-sm text-muted">
          This permanently deletes your profile, listings, crew history, reviews you wrote and your e-mail preferences. This cannot be undone.
        </p>
        <Field label={`Type ${username} to confirm`} htmlFor="confirm_username">
          <Input id="confirm_username" name="confirm_username" autoComplete="off" required />
        </Field>
        <FormMessage message={state.message} />
        <SubmitButton variant="danger" size="sm" className="self-start" pendingText="Deleting…">
          Permanently delete account
        </SubmitButton>
      </form>
    </details>
  );
}
