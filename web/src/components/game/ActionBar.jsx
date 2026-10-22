export function ActionBar({ callAmount = "12,345" }) {
  const base =
    "h-[clamp(2.5rem,7vmin,3.3rem)] rounded-full px-[clamp(1.3rem,3.5vmin,1.9rem)] text-[clamp(0.9rem,2.3vmin,1.05rem)] font-medium transition-colors"
  return (
    <div className="flex items-center justify-end gap-2 portrait:justify-stretch portrait:[&>button]:flex-1">
      <button type="button" className={`${base} border-[1.3px] border-ink/70 text-ink hover:bg-ink/10`}>
        Fold
      </button>
      <button type="button" className={`${base} flex items-center gap-2 border-[1.3px] border-ink/70 bg-accent text-accent-ink hover:brightness-105`}>
        Call
        <span className="font-mono">${callAmount}</span>
      </button>
      <button type="button" className={`${base} border-[1.3px] border-ink/70 text-ink hover:bg-ink/10`}>
        Raise
      </button>
    </div>
  )
}
