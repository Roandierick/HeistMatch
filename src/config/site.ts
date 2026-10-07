const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const siteConfig = {
  name: "HeistMatch",
  seoName: "GTA 6 Heist Finder",
  tagline: "Find your crew. Run the heist.",
  description:
    "HeistMatch is the GTA 6 Heist Finder. Find reliable GTA 6 players, match with the right crew and start your next heist.",
  url: siteUrl,
  domain: new URL(siteUrl).hostname.replace(/^www\./, ""),
  /** Only "production" is indexable. Previews and local builds are noindex. */
  isProduction: process.env.NEXT_PUBLIC_SITE_ENV === "production",
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || undefined,
  socials: [] as { name: string; href: string }[],
  /** Bump when the opt-in wording changes; stored with every consent. */
  consentVersion: "2026-10-v1",
  /** Legal entity details shown on legal pages. Fill in before launch. */
  legal: {
    entity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || "RD Future Solutions",
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || undefined,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@rdfuturesolutions",
    lastUpdated: "2026-10-04",
  },
  consentText: "Send me GTA 6 news, new heists, platform updates and HeistMatch emails.",
  disclaimer:
    "HeistMatch is an independent fan platform. It is not affiliated with, endorsed by or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA are trademarks of Take-Two Interactive Software, Inc., used here for descriptive purposes only.",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
