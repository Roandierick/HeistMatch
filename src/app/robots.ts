import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Staging / previews: block everything (plus X-Robots-Tag in next.config).
  if (!siteConfig.isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth and newsletter pages stay crawlable so their noindex is seen.
        disallow: ["/api/", "/admin", "/account", "/auth/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
