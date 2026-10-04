import { z } from "zod";
import type { ActionState } from "@/lib/action-result";

export function formToObject(formData: FormData): Record<string, FormDataEntryValue> {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("$ACTION")) out[key] = value;
  }
  return out;
}

export function validationFailure(error: z.ZodError, message = "Please fix the highlighted fields."): ActionState {
  return { ok: false, message, fieldErrors: z.flattenError(error).fieldErrors as ActionState["fieldErrors"] };
}
