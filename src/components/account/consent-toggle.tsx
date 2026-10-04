"use client";

import { useActionState } from "react";
import { setMarketingConsent } from "@/actions/account";
import { initialActionState } from "@/lib/action-result";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { siteConfig } from "@/config/site";

export function ConsentToggle({ subscribed, pending }: { subscribed: boolean; pending: boolean }) {
  const [state, action] = useActionState(setMarketingConsent, initialActionState);
  const isOn = state.ok ? state.message === "You're subscribed." : subscribed;
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-sm text-muted">{siteConfig.consentText}</p>
      <p className="text-sm">
        Status:{" "}
        <span className={isOn ? "text-success" : "text-muted"}>
          {isOn ? "Subscribed" : pending ? "Waiting for confirmation" : "Not subscribed"}
        </span>
      </p>
      <input type="hidden" name="subscribe" value={isOn ? "false" : "true"} />
      <SubmitButton variant={isOn ? "secondary" : "primary"} size="sm" className="self-start" pendingText="Saving…">
        {isOn ? "Unsubscribe" : "Subscribe"}
      </SubmitButton>
      {state.message && !state.ok && <FormMessage message={state.message} />}
    </form>
  );
}
