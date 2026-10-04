import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/heists", label: "Listings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/posts", label: "Blog" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <Container className="pt-8 pb-16">
      <div className="flex flex-col gap-6 md:flex-row">
        <nav aria-label="Admin" className="md:w-48 md:shrink-0">
          <p className="mb-3 text-xs font-semibold tracking-wide text-subtle uppercase">Admin</p>
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted hover:bg-surface-2 hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
