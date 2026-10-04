import type { NextConfig } from "next";

const imageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    imageHosts.push(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host);
  } catch {
    // ignore malformed env
  }
}

const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Staging/preview must never be indexed.
  ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Clean, canonical URLs for common variants.
    return [
      { source: "/heists", destination: "/find", permanent: true },
      { source: "/find-heists", destination: "/find", permanent: true },
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/register", destination: "/sign-up", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },
      { source: "/news", destination: "/blog/category/news", permanent: true },
    ];
  },
};

export default nextConfig;
