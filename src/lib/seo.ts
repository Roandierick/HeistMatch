import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

export type Crumb = { name: string; path: string };

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is, without the "| HeistMatch" suffix. */
  absoluteTitle?: boolean;
  noindex?: boolean;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
};

/**
 * One place that builds canonical, robots, OpenGraph and Twitter metadata so
 * every indexable page gets a consistent, unique set.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const fullTitle = input.absoluteTitle ? input.title : `${input.title} | ${siteConfig.name}`;
  const images = input.image ? [{ url: input.image.startsWith("/") ? absoluteUrl(input.image) : input.image }] : undefined;
  const indexable = siteConfig.isProduction && !input.noindex;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: !input.noindex || siteConfig.isProduction },
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description: input.description,
      locale: "en_US",
      ...(images ? { images } : {}),
      ...(input.type === "article"
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime: input.modifiedTime ?? undefined,
            authors: input.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle } : {}),
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
    ...(siteConfig.socials.length ? { sameAs: siteConfig.socials.map((s) => s.href) } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.name,
    alternateName: siteConfig.seoName,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  published_at: string | null;
  updated_at: string;
  author_name: string;
  featured_image: string | null;
  category: string;
}) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.featured_image
    ? post.featured_image.startsWith("/") ? absoluteUrl(post.featured_image) : post.featured_image
    : absoluteUrl("/opengraph-image");
  return {
    "@context": "https://schema.org",
    "@type": post.category === "news" ? "NewsArticle" : "Article",
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [image],
    datePublished: post.published_at ?? post.updated_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author_name, url: absoluteUrl("/") },
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}
