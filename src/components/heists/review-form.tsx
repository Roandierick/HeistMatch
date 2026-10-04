"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/actions/heists";
import { initialActionState } from "@/lib/action-result";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/components/ui/cn";
import { IconStar } from "@/components/ui/icons";

export function ReviewForm({ heistId, userId, username }: { heistId: string; userId: string; username: string }) {
  const [state, action] = useActionState(submitReview, initialActionState);
  const [rating, setRating] = useState(0);

  if (state.ok) return <FormMessage ok message={state.message} />;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="heist_id" value={heistId} />
      <input type="hidden" name="reviewed_user_id" value={userId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <fieldset>
        <legend className="text-sm text-fg">Would you play with {username} again?</legend>
        <div className="mt-2 flex gap-2">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="play_again" value={v} required className="peer sr-only" />
              <span className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm capitalize text-muted peer-checked:border-accent/60 peer-checked:bg-accent/10 peer-checked:text-fg peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                {v}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-1" role="group" aria-label="Optional star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n === rating ? 0 : n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={rating >= n}
            className="rounded p-0.5"
          >
            <IconStar className={cn("size-5", rating >= n ? "text-accent" : "text-surface-3")} />
          </button>
        ))}
        <span className="ml-2 text-xs text-subtle">optional</span>
      </div>
      {state.message && <FormMessage message={state.message} />}
      <SubmitButton size="sm" variant="secondary" className="self-start" pendingText="Saving…">
        Submit feedback
      </SubmitButton>
    </form>
  );
}
