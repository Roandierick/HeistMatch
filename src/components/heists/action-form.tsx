"use client";

import { useActionState, type ReactNode } from "react";
import { initialActionState, type ActionState } from "@/lib/action-result";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form";
import type { ComponentProps } from "react";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** A one-button form bound to a server action, with pending + result feedback. */
export function ActionButtonForm({
  action,
  hidden,
  children,
  pendingText,
  variant,
  className,
  onSubmitCapture,
  confirmText,
}: {
  action: Action;
  hidden: Record<string, string>;
  children: ReactNode;
  pendingText?: string;
  variant?: ComponentProps<typeof SubmitButton>["variant"];
  className?: string;
  onSubmitCapture?: () => void;
  confirmText?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form
      action={formAction}
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) {
          e.preventDefault();
          return;
        }
        onSubmitCapture?.();
      }}
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton variant={variant} pendingText={pendingText} className={className}>
        {children}
      </SubmitButton>
      <FormMessage ok={state.ok} message={state.message} />
    </form>
  );
}
