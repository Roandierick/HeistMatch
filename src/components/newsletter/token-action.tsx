"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-result";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function TokenActionForm({
  action,
  token,
  label,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  token: string;
  label: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  if (state.message) return <FormMessage ok={state.ok} message={state.message} />;
  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <SubmitButton className="w-full">{label}</SubmitButton>
    </form>
  );
}
