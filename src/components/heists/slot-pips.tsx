export function SlotPips({ needed, joined }: { needed: number; joined: number }) {
  const open = Math.max(needed - joined, 0);
  return (
    <span className="flex items-center gap-2" aria-label={`${joined} of ${needed} players joined, ${open} open`}>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: needed }, (_, i) => (
          <span key={i} className={i < joined ? "size-2.5 rounded-full bg-accent" : "size-2.5 rounded-full border border-line-strong"} />
        ))}
      </span>
      <span className="text-fg">
        {open === 0 ? "Full" : `${open} slot${open === 1 ? "" : "s"} open`}
      </span>
    </span>
  );
}
