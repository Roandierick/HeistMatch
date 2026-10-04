"use client";

import { joinHeist } from "@/actions/heists";
import { track } from "@/lib/analytics/client";
import { EVENTS } from "@/lib/analytics/events";
import { ActionButtonForm } from "./action-form";

export function JoinButton({ heistId }: { heistId: string }) {
  return (
    <ActionButtonForm
      action={joinHeist}
      hidden={{ heist_id: heistId }}
      pendingText="Joining…"
      className="w-full"
      onSubmitCapture={() => track(EVENTS.heistJoinClicked, { heist_id: heistId })}
    >
      Join this heist
    </ActionButtonForm>
  );
}
