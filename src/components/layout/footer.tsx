import Link from "next/link";
import { BLOG_CATEGORIES } from "@/config/blog";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

const PRODUCT_LINKS = [
  { href: "/find", label: "GTA 6 Heist Finder" },
  { href: "/create", label: "Create a Heist" },
  { href: "/sign-up", label: "Create account" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-muted">{siteConfig.tagline} The GTA 6 Heist Finder for players who want a reliable crew.</p>
          {siteConfig.socials.length > 0 && (
            <ul className="mt-4 flex gap-3">
              {siteConfig.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener noreferrer me" target="_blank" className="text-sm text-muted hover:text-fg">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterColumn title="Product" links={PRODUCT_LINKS} />
        <FooterColumn
          title="Blog"
          links={[{ href: "/blog", label: "All articles" }, ...BLOG_CATEGORIES.slice(0, 4).map((c) => ({ href: `/blog/category/${c.slug}`, label: c.name }))]}
        />
        <FooterColumn title="Legal" links={LEGAL_LINKS} />
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-3 py-6 text-xs leading-relaxed text-subtle md:flex-row md:items-start md:justify-between">
          <p>© {new Date().getFullYear()} HeistMatch</p>
          <p className="max-w-3xl md:text-right">{siteConfig.disclaimer}</p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
