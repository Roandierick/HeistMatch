// Minimal inline icon set (no icon library in the bundle).
import type { SVGProps } from "react";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMic = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>
);
export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconGlobe = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);
export const IconStar = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></svg>
);
export const IconFilter = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const IconFlag = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
);
export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...base} {...p}><path d="M13 3 5 14h6l-1 7 8-11h-6Z" /></svg>
);
