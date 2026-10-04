import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="hero-glow">
      <Container className="flex max-w-md flex-col py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <Card className="mt-6 p-5 sm:p-6">{children}</Card>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </Container>
    </div>
  );
}
