"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/actions/newsletter";
import { initialActionState } from "@/lib/action-result";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { NEWSLETTER_SOURCES } from "@/lib/validation/misc";

export function NewsletterForm({ source }: { source: (typeof NEWSLETTER_SOURCES)[number] }) {
  const [state, action] = useActionState(subscribeNewsletter, initialActionState);
  const inputId = `newsletter-email-${source}`;

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          E-mail address
        </label>
        <Input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@example.com"
          aria-invalid={state.message ? true : undefined}
          className="sm:flex-1"
        />
        <input type="hidden" name="source" value={source} />
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <SubmitButton pendingText="Subscribing…">Subscribe</SubmitButton>
      </div>
      {state.message ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : (
        <p className="text-xs text-subtle">
          Free. Confirm by e-mail, unsubscribe any time. See our <a href="/privacy" className="underline hover:text-fg">Privacy Policy</a>.
        </p>
      )}
    </form>
  );
}
