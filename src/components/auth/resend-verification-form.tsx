"use client";

import { useActionState } from "react";
import { resendVerification } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResendVerificationForm({ email }: { email: string }) {
  const [state, action] = useActionState(resendVerification, initialActionState);
  if (state.ok) return <FormMessage ok message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      <FormMessage message={state.message} />
      <SubmitButton variant="secondary" pendingText="Sending…">Resend verification e-mail</SubmitButton>
    </form>
  );
}
