import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-lg border border-line bg-surface-2 px-3 text-[0.95rem] text-fg placeholder:text-subtle transition-colors hover:border-line-strong focus:border-accent/60 focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger/60";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  optional,
}: {
  label: string;
  htmlFor: string;
  error?: string[] | string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {label}
        {optional && <span className="ml-1 font-normal text-subtle">(optional)</span>}
      </label>
      {children}
      {message ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-11 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle"
        fill="currentColor"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-muted", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer rounded border-line-strong bg-surface-2 accent-[var(--color-accent)]"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <div
      role={ok ? "status" : "alert"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm",
        ok ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger",
      )}
    >
      {message}
    </div>
  );
}
