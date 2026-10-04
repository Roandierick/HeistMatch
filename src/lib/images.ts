// Hosts next/image may optimise. Mirrors images.remotePatterns in next.config.ts.
export function imageHosts(): string[] {
  const hosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean);
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) hosts.push(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host);
  } catch {
    // ignore malformed env
  }
  return hosts;
}

export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && imageHosts().includes(url.host);
  } catch {
    return false;
  }
}
