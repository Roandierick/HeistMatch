"use client";

import { leaveHeist, updateHeistStatus } from "@/actions/heists";
import { ActionButtonForm } from "./action-form";

export function HostControls({ heistId, status }: { heistId: string; status: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {status !== "in_progress" && (
        <ActionButtonForm action={updateHeistStatus} hidden={{ heist_id: heistId, status: "in_progress" }} variant="secondary" className="w-full">
          Mark as started
        </ActionButtonForm>
      )}
      <ActionButtonForm action={updateHeistStatus} hidden={{ heist_id: heistId, status: "completed" }} variant="secondary" className="w-full">
        Mark as completed
      </ActionButtonForm>
      <ActionButtonForm
        action={updateHeistStatus}
        hidden={{ heist_id: heistId, status: "cancelled" }}
        variant="danger"
        className="w-full"
        confirmText="Cancel this heist? Players in your crew will see it as cancelled."
      >
        Cancel heist
      </ActionButtonForm>
    </div>
  );
}

export function LeaveButton({ heistId }: { heistId: string }) {
  return (
    <ActionButtonForm action={leaveHeist} hidden={{ heist_id: heistId }} variant="ghost" className="w-full" confirmText="Leave this crew?">
      Leave crew
    </ActionButtonForm>
  );
}
