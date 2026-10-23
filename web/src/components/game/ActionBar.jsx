import { useId, useRef, useState } from "react"

export function ActionBar({ legal, onAction, pot }) {
  const base =
    "min-h-11 h-[clamp(2.75rem,7vmin,3.3rem)] rounded-full px-[clamp(1.3rem,3.5vmin,1.9rem)] portrait:px-2 text-[clamp(0.9rem,2.3vmin,1.05rem)] font-medium transition-colors disabled:opacity-40"
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [raiseTo, setRaiseTo] = useState(legal.minRaise)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const raisePanelId = useId()
  const raiseRangeId = useId()
  const raiseButton = useRef(null)
  const clamp = (value) => Math.min(legal.maxRaise, Math.max(legal.minRaise, value))
  const closeRaise = () => {
    setRaiseOpen(false)
    raiseButton.current?.focus()
  }
  const presets = [
    { label: "All In", value: legal.maxRaise },
    { label: "½ Pot", value: clamp(Math.round(pot / 2)) },
    { label: "Pot", value: clamp(pot) },
  ]

  return (
    <div className="flex flex-col items-end gap-2 portrait:items-stretch">
      {raiseOpen && (
        <div id={raisePanelId} className="portrait:w-full">
          <div className="flex items-stretch gap-2 rounded-2xl border-[1.3px] border-ink/70 bg-card-face p-3 shadow-[0_0.5em_2em_rgb(0_0_0_/_0.3)] portrait:hidden">
            <div className="flex flex-col justify-center gap-2">
              <button
                type="button"
                aria-pressed={selectedPreset === "All In"}
                onClick={() => { setRaiseTo(legal.maxRaise); setSelectedPreset("All In") }}
                className={`min-h-11 rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  raiseTo === legal.maxRaise ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
                }`}
              >
                All In
              </button>
              {presets.slice(1).map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  aria-pressed={selectedPreset === preset.label}
                  onClick={() => { setRaiseTo(preset.value); setSelectedPreset(preset.label) }}
                  className={`min-h-11 rounded-full border-[1.3px] px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    raiseTo === preset.value ? "border-suit-dark bg-suit-dark text-card-face" : "border-suit-dark/50 text-suit-dark hover:bg-suit-dark/10"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={selectedPreset === "+20"}
                onClick={() => { setRaiseTo((value) => Math.min(value + 20, legal.maxRaise)); setSelectedPreset("+20") }}
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
                disabled={legal.minRaise === legal.maxRaise}
                onChange={(e) => { setRaiseTo(Number(e.target.value)); setSelectedPreset(null) }}
                className="w-11 min-h-24 flex-1 accent-[#292522] [direction:rtl] [writing-mode:vertical-lr]"
                aria-label="Raise to total for this street"
              />
            </div>
          </div>
          <div className="hidden w-full rounded-2xl border-[1.3px] border-ink/70 bg-card-face p-2 text-suit-dark shadow-[0_0.5em_2em_rgb(0_0_0_/_0.3)] portrait:block">
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <label htmlFor={raiseRangeId} className="shrink-0 leading-tight">
                Raise to
                <output className="mt-0.5 block font-mono text-lg">${raiseTo.toLocaleString()}</output>
              </label>
              <input
                id={raiseRangeId}
                type="range"
                min={legal.minRaise}
                max={legal.maxRaise}
                step={1}
                value={raiseTo}
                disabled={legal.minRaise === legal.maxRaise}
                onChange={(e) => { setRaiseTo(Number(e.target.value)); setSelectedPreset(null) }}
                aria-label="Raise to total for this street"
                aria-valuetext={`${raiseTo} chips`}
                className="h-11 w-0 min-w-11 flex-1 accent-[#292522]"
              />
              <button
                type="button"
                onClick={closeRaise}
                aria-label="Close raise editor"
                className="grid size-11 shrink-0 place-items-center rounded-full text-2xl leading-none hover:bg-suit-dark/10"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  aria-pressed={selectedPreset === preset.label}
                  onClick={() => { setRaiseTo(preset.value); setSelectedPreset(preset.label) }}
                  className={`min-h-11 min-w-0 rounded-full border border-suit-dark/40 px-1 text-xs text-center whitespace-nowrap ${selectedPreset === preset.label ? "bg-suit-dark text-card-face" : ""}`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={selectedPreset === "+20"}
                onClick={() => { setRaiseTo((value) => Math.min(value + 20, legal.maxRaise)); setSelectedPreset("+20") }}
                className={`min-h-11 min-w-0 rounded-full border border-suit-dark/40 px-1 text-xs text-center whitespace-nowrap ${selectedPreset === "+20" ? "bg-suit-dark text-card-face" : ""}`}
              >
                +20
              </button>
            </div>
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
          ref={raiseButton}
          aria-expanded={raiseOpen}
          aria-controls={raiseOpen ? raisePanelId : undefined}
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
