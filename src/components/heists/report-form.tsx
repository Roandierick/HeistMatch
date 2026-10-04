"use client";

import { useActionState } from "react";
import { submitReport } from "@/actions/heists";
import { initialActionState } from "@/lib/action-result";
import { Field, FormMessage, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { IconFlag } from "@/components/ui/icons";
import { REPORT_REASONS } from "@/config/options";

export function ReportForm({ targetType, targetId, label = "Report" }: { targetType: "heist" | "user"; targetId: string; label?: string }) {
  const [state, action] = useActionState(submitReport, initialActionState);
  const id = `report-${targetType}-${targetId}`;

  return (
    <details className="group text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-subtle hover:text-fg [&::-webkit-details-marker]:hidden">
        <IconFlag className="size-4" /> {label}
      </summary>
      {state.ok ? (
        <div className="mt-3">
          <FormMessage ok message={state.message} />
        </div>
      ) : (
        <form action={action} className="mt-3 flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-3">
          <input type="hidden" name="target_type" value={targetType} />
          <input type="hidden" name="target_id" value={targetId} />
          <Field label="Reason" htmlFor={`${id}-reason`} error={state.fieldErrors?.reason}>
            <Select id={`${id}-reason`} name="reason" defaultValue="" required>
              <option value="" disabled>Choose a reason</option>
              {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Details" htmlFor={`${id}-details`} optional error={state.fieldErrors?.details}>
            <Textarea id={`${id}-details`} name="details" maxLength={500} className="min-h-20" />
          </Field>
          {!state.ok && state.message && <FormMessage message={state.message} />}
          <SubmitButton variant="secondary" size="sm" pendingText="Sending…">Send report</SubmitButton>
        </form>
      )}
    </details>
  );
}
