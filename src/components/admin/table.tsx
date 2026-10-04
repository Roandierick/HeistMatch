import type { ReactNode } from "react";

export function AdminTable({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-2 text-xs tracking-wide text-subtle uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {empty ? (
            <tr>
              <td colSpan={head.length} className="px-3 py-8 text-center text-muted">Nothing here.</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 align-top ${className}`}>{children}</td>;
}

export function AdminTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
