import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/config/site";

export function LegalPage({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  return (
    <Container className="max-w-3xl pt-8 pb-16">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-subtle">Last updated {formatDate(siteConfig.legal.lastUpdated)}</p>
      <div className="prose-hm mt-8">{children}</div>
    </Container>
  );
}
