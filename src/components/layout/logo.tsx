import Link from "next/link";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#14171e" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="none" stroke="rgb(255 255 255 / 0.12)" />
      <path d="M9 8v16M23 8v16M9 16h14" stroke="#e8b84a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.4" fill="#08090c" stroke="#e8b84a" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label="HeistMatch home">
      <LogoMark />
      <span className="text-[1.05rem] font-semibold tracking-tight text-fg">
        Heist<span className="text-accent">Match</span>
      </span>
    </Link>
  );
}
