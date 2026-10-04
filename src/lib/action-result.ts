export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Submitted values echoed back on failure, so React's form reset doesn't wipe user input. */
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

const NEVER_ECHO = /password|token|confirm/i;

export function withValues(state: ActionState, formData: FormData): ActionState {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && !NEVER_ECHO.test(key)) values[key] = value;
  }
  return { ...state, values };
}
