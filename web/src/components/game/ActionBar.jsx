import { useState } from "react"

export function ActionBar({ legal, onAction, pot }) {
  const base =
    "min-h-11 h-[clamp(2.75rem,7vmin,3.3rem)] rounded-full px-[clamp(1.3rem,3.5vmin,1.9rem)] portrait:px-2 text-[clamp(0.9rem,2.3vmin,1.05rem)] font-medium transition-colors disabled:opacity-40"
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [raiseTo, setRaiseTo] = useState(legal.minRaise)
  const presets = [
    { label: "1/2 Pot", value: Math.min(legal.maxRaise, Math.max(legal.minRaise, Math.round(pot / 2))) },
    { label: "Pot", value: Math.min(legal.maxRaise, Math.max(legal.minRaise, pot)) },
  ]

  return (
    <div className="flex flex-col items-end gap-2 portrait:items-stretch">
      {raiseOpen && (
        <div className="flex items-stretch gap-2 rounded-2xl border-[1.3px] border-ink/70 bg-card-face p-3 shadow-[0_0.5em_2em_rgb(0_0_0_/_0.3)]">
          <div className="flex flex-col justify-center gap-2 portrait:max-sm:grid portrait:max-sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRaiseTo(legal.maxRaise)}
              className={`min-h-11 rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                raiseTo === legal.maxRaise ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
              }`}
            >
              All In
            </button>
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => setRaiseTo(p.value)}
                className={`min-h-11 rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  raiseTo === p.value ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRaiseTo((v) => Math.min(v + 20, legal.maxRaise))}
              className="min-h-11 rounded-full border-[1.3px] border-suit-dark/50 px-4 py-1.5 text-sm font-medium text-suit-dark transition-colors hover:bg-suit-dark/10"
            >
              +20
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="w-16 text-center font-mono text-lg text-suit-dark">${raiseTo.toLocaleString()}</span>
            <input
              type="range"
              min={legal.minRaise}
              max={legal.maxRaise}
              step={1}
              value={raiseTo}
              onChange={(e) => setRaiseTo(Number(e.target.value))}
              className="w-11 min-h-24 flex-1 accent-[#292522] [direction:rtl] [writing-mode:vertical-lr]"
              aria-label="Raise to total for this street"
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 portrait:[&>button]:flex-1">
        <button type="button" onClick={() => onAction('fold')} className={`${base} flex items-center justify-center border-[1.3px] border-ink/70 text-ink hover:bg-ink/10`}>
          Fold
        </button>
        <button type="button" onClick={() => onAction(legal.call ? 'call' : 'check')} className={`${base} flex items-center justify-center gap-2 border-[1.3px] border-ink/70 bg-accent text-accent-ink hover:brightness-105`}>
          <span>{legal.call ? 'Call' : 'Check'}</span>
          {legal.call > 0 && <span className="font-mono">${legal.call.toLocaleString()}</span>}
        </button>
        <button
          type="button"
          disabled={!legal.canRaise}
          aria-label={raiseOpen ? `Confirm raise to ${raiseTo}` : 'Raise'}
          onClick={() => raiseOpen ? onAction('raise', raiseTo) : setRaiseOpen(true)}
          className={`${base} flex items-center justify-center gap-2 border-[1.3px] ${
            raiseOpen ? "border-accent bg-accent text-accent-ink" : "border-ink/70 text-ink hover:bg-ink/10"
          }`}
        >
          <span>Raise</span>
          {raiseOpen && <span className="w-8 text-right font-mono">${raiseTo.toLocaleString()}</span>}
        </button>
      </div>
    </div>
  )
}
