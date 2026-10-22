import { CardBack, PlayingCard } from "./PlayingCard"

function PersonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[58%] text-avatar-glyph" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7H4Z" />
    </svg>
  )
}

function Avatar() {
  return (
    <div className="grid size-[5.6em] shrink-0 place-items-center rounded-full bg-avatar ring-[0.14em] ring-ink/80 ring-offset-[0.28em] ring-offset-bg shadow-[0_0.2em_0.8em_rgb(0_0_0_/_0.4)]">
      <PersonGlyph />
    </div>
  )
}

function Label({ name, stack }) {
  return (
    <div className="leading-tight whitespace-nowrap">
      <div className="text-[0.95em] text-ink-dim">{name}</div>
      <div className="font-mono text-[1.5em] font-light text-ink">{stack}</div>
    </div>
  )
}

// Fanned pair: second card overlaps the first, both slightly tilted.
function Fan({ children }) {
  return <div className="flex [&>*:not(:first-child)]:-ml-[1.5em]">{children}</div>
}

// Status badge: "d" (active/dealer placeholder) or "x" (folded). Center is
// anchored on the table border by the parent (GamePage positions it).
export function StatusBadge({ status }) {
  const shadow = "shadow-[0_0.15em_0.4em_rgb(0_0_0_/_0.5)]"
  if (status === "x") {
    return (
      <div className={`grid size-[2em] place-items-center rounded-full border-[0.12em] border-ink/70 bg-avatar ${shadow}`}>
        <svg viewBox="0 0 24 24" className="size-[45%]" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </div>
    )
  }
  return (
    <div className={`grid size-[2em] place-items-center rounded-full bg-[#cfc3b4] font-card text-[1.05em] font-medium text-[#1d2021] ${shadow}`}>
      D
    </div>
  )
}

/**
 * side: "left" | "right" | "top" | "hero" — composition per table position.
 * All sizes em-based; inherits --stage-scale from the stage element.
 */
export function Seat({ side, name, stack, cards = [], state = "active" }) {
  const faded = state === "folded"
  const avatar = <Avatar />
  const label = <Label name={name} stack={stack} />

  const cardEls = cards.length ? (
    <div className={`flex ${faded ? "opacity-60" : ""}`}>
      <Fan>
        {cards.map((c, i) =>
          c.rank ? (
            <PlayingCard key={i} size="lg" tilt={i === 0 ? -9 : 6} {...c} />
          ) : (
            <CardBack key={i} tilt={i === 0 ? -9 : 6} folded={faded} />
          ),
        )}
      </Fan>
    </div>
  ) : null

  if (state === "empty") {
    return (
      <div className="flex flex-col items-center gap-[0.6em] opacity-40">
        {avatar}
        <div className="text-[0.9em] text-ink-dim">Sit here</div>
      </div>
    )
  }

  if (side === "left" || side === "right") {
    return (
      <div className="flex flex-col">
        <div className={`flex items-center ${side === "right" ? "flex-row-reverse" : ""}`}>
          {avatar}
          {cardEls}
        </div>
        <div className={`mt-[0.7em] ${side === "right" ? "self-end" : ""} w-[5.6em]`}>{label}</div>
      </div>
    )
  }

  // "top" and "hero": single row [avatar, cards, label]
  return (
    <div className="flex items-center gap-[0.9em]">
      {avatar}
      {cardEls}
      {label}
    </div>
  )
}
