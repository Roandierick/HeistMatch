"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";
import type { ComponentProps } from "react";

export function SubmitButton({
  children,
  pendingText,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
