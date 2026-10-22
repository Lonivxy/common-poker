import { useState } from "react"

// ponytail: preview-only raise panel; values come from game state later
const POT = 540
const STACK = 1080

const PRESETS = [
  { label: "1/2 Pot", value: POT / 2 },
  { label: "Pot", value: POT },
]

const MIN = 10

export function ActionBar({ callAmount = "12,345" }) {
  const base =
    "h-[clamp(2.5rem,7vmin,3.3rem)] rounded-full px-[clamp(1.3rem,3.5vmin,1.9rem)] text-[clamp(0.9rem,2.3vmin,1.05rem)] font-medium transition-colors"
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [raiseTo, setRaiseTo] = useState(PRESETS[0].value)

  return (
    <div className="flex flex-col items-end gap-2 portrait:items-stretch">
      {raiseOpen && (
        <div className="flex items-stretch gap-2 rounded-2xl border-[1.3px] border-ink/70 bg-card-face p-3 shadow-[0_0.5em_2em_rgb(0_0_0_/_0.3)]">
          {/* presets + stepper, ordered by value (all in on top) */}
          <div className="flex flex-col justify-center gap-2">
            <button
              type="button"
              onClick={() => setRaiseTo(STACK)}
              className={`rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                raiseTo === STACK ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
              }`}
            >
              All In
            </button>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setRaiseTo(p.value)}
                className={`rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  raiseTo === p.value ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRaiseTo((v) => Math.min(v + 10, STACK))}
              className="rounded-full border-[1.3px] border-suit-dark/50 px-4 py-1.5 text-sm font-medium text-suit-dark transition-colors hover:bg-suit-dark/10"
            >
              +10
            </button>
          </div>
          {/* amount + vertical slider */}
          <div className="flex flex-col items-center gap-2">
            <span className="w-16 text-center font-mono text-lg text-suit-dark">${raiseTo.toLocaleString()}</span>
            <input
              type="range"
              min={MIN}
              max={STACK}
              step={10}
              value={raiseTo}
              onChange={(e) => setRaiseTo(Number(e.target.value))}
              className="w-1.5 min-h-24 flex-1 accent-[#292522] [direction:rtl] [writing-mode:vertical-lr]"
              aria-label="Raise amount"
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 portrait:justify-stretch portrait:[&>button]:flex-1">
        <button type="button" className={`${base} border-[1.3px] border-ink/70 text-ink hover:bg-ink/10`}>
          Fold
        </button>
        <button type="button" className={`${base} flex items-center gap-2 border-[1.3px] border-ink/70 bg-accent text-accent-ink hover:brightness-105`}>
          Call
          <span className="font-mono">${callAmount}</span>
        </button>
        <button
          type="button"
          onClick={() => setRaiseOpen((o) => !o)}
          className={`${base} flex items-center gap-2 border-[1.3px] ${
            raiseOpen ? "border-accent bg-accent text-accent-ink" : "border-ink/70 text-ink hover:bg-ink/10"
          }`}
        >
          Raise
          {raiseOpen && <span className="w-8 text-right font-mono">${raiseTo.toLocaleString()}</span>}
        </button>
      </div>
    </div>
  )
}
