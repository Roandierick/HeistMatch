import { NewsletterForm } from "./newsletter-form";
import type { NEWSLETTER_SOURCES } from "@/lib/validation/misc";
import { newsletterEmailAvailable } from "@/lib/email";

export function NewsletterSection({
  source,
  headingLevel = "h2",
}: {
  source: (typeof NEWSLETTER_SOURCES)[number];
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const available = newsletterEmailAvailable();
  return (
    <section aria-labelledby={`newsletter-${source}`} className="glass hero-glow rounded-2xl p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <Heading id={`newsletter-${source}`} className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            Stay ahead of GTA 6 Online
          </Heading>
          <p className="mt-2 text-muted">Get GTA 6 news, heist updates and new guides directly in your inbox.</p>
        </div>
        {available ? (
          <NewsletterForm source={source} />
        ) : (
          <p className="rounded-lg border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
            Newsletter signups are not available yet.
          </p>
        )}
      </div>
    </section>
  );
}
