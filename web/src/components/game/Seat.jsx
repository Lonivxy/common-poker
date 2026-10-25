import { useEffect, useState } from "react"
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import { motionTokens } from "../../motion"
import { CardBack, PlayingCard } from "./PlayingCard"

function PersonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[58%] text-avatar-glyph" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7H4Z" />
    </svg>
  )
}

function Avatar({ active, deadline, clockOffset, name }) {
  const progress = useMotionValue(1)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!active || !deadline) {
      progress.set(1)
      return
    }
    const seconds = Math.max(0, Math.min(20, (deadline * 1000 - Date.now() - clockOffset) / 1000))
    if (reduce) {
      progress.set(1)
      return
    }
    progress.set(seconds / 20)
    const animation = animate(progress, 0, { duration: seconds, ease: "linear" })
    return () => animation.stop()
  }, [active, deadline, clockOffset, progress, reduce])
  return (
    <div role="img" aria-label={active ? `${name}'s turn` : name} className="relative">
      <div className="relative grid size-[5.6em] shrink-0 place-items-center rounded-full bg-avatar ring-[0.14em] ring-ink/80 ring-offset-[0.28em] ring-offset-bg shadow-[0_0.2em_0.8em_rgb(0_0_0_/_0.4)]">
        <PersonGlyph />
      </div>
      {active && <svg viewBox="0 0 64 64" className="turn-ring" aria-hidden="true">
        <motion.circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: progress }} />
      </svg>}
    </div>
  )
}

function Label({ name, stack, dealer, connected }) {
  return (
    <div className="leading-tight whitespace-nowrap">
      <div className="text-[0.95em] text-ink-dim" title={dealer ? "Dealer" : undefined}>{name}<span className="sr-only">{dealer ? " · dealer" : ""}{!connected ? " · offline" : ""}</span></div>
      <div className="font-mono text-[1.5em] font-light text-ink">${stack.toLocaleString()}</div>
    </div>
  )
}

// Fanned pair: second card overlaps the first, both slightly tilted.
function Fan({ children }) {
  return <div className="flex [&>*:not(:first-child)]:-ml-[1.5em]">{children}</div>
}

function FlipCard({ card, tilt, revealed, onToggle, size = "lg", delay = 0 }) {
  const reduce = useReducedMotion()
  const dims = { sm: "h-[4.9em] w-[3.2em]", lg: "h-[5.5em] w-[4em]" }[size]
  if (reduce) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={revealed ? "Hide hand" : "Reveal hand"}
        className={`${dims} shrink-0 cursor-pointer`}
        style={{ rotate: `${tilt}deg` }}
      >
        {revealed ? <PlayingCard size={size} {...card} /> : <CardBack size={size} />}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={revealed ? "Hide hand" : "Reveal hand"}
      className={`${dims} shrink-0 cursor-pointer`}
      style={{ perspective: "40em", rotate: `${tilt}deg` }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ ...motionTokens.spring.smooth, delay }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <CardBack size={size} />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <PlayingCard size={size} {...card} />
        </div>
      </motion.div>
    </button>
  )
}

// D means acted; X means folded. Positioned by GamePage.
export function StatusBadge({ status }) {
  const shadow = "shadow-[0_0.15em_0.4em_rgb(0_0_0_/_0.5)]"
  if (status === "x") {
    return (
      <div aria-label="Folded" className={`grid size-[2em] place-items-center rounded-full border-[0.12em] border-ink/70 bg-avatar ${shadow}`}>
        <svg viewBox="0 0 24 24" className="size-[45%]" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </div>
    )
  }
  return (
    <div aria-label="Has acted" className={`grid size-[2em] place-items-center rounded-full bg-[#cfc3b4] font-card text-[1.05em] font-medium text-[#1d2021] ${shadow}`}>
      D
    </div>
  )
}

// Bet badge: current call/raise amount sitting beside the status badge.
// Hidden when the player hasn't bet this street.
export function BetBadge({ amount }) {
  if (amount == null) return null
  return (
    <div aria-label={`Street bet ${amount}`} className="grid h-[2em] place-items-center rounded-full border-[0.12em] border-ink/70 bg-avatar px-[0.55em] font-mono text-[1em] text-ink shadow-[0_0.15em_0.4em_rgb(0_0_0_/_0.5)]">
      {amount}
    </div>
  )
}

/**
 * side: "left" | "right" | "top" | "hero" — composition per table position.
 * All sizes em-based; inherits --stage-scale from the stage element.
 */
export function Seat({ side, name, stack, cards = [], state = "active", active, deadline, clockOffset, connected, dealer }) {
  const faded = state === "folded"
  const [revealed, setRevealed] = useState(true)
  const avatar = <Avatar active={active} deadline={deadline} clockOffset={clockOffset} name={name} />
  const label = <Label name={name} stack={stack} dealer={dealer} connected={connected} />

  const cardEls = cards.length ? (
    <div className={`flex ${faded ? "opacity-60" : ""}`}>
      <Fan>
        {cards.map((c, i) => {
          const size = side === "hero" ? "lg" : "sm"
          const tilt = i === 0 ? -9 : 6
          return c.rank ? (
            <FlipCard
              key={i}
              card={c}
              tilt={tilt}
              size={size}
              delay={i * motionTokens.stagger.card}
              revealed={revealed}
              onToggle={() => setRevealed((r) => !r)}
            />
          ) : (
            <CardBack key={i} tilt={tilt} size={size} folded={faded} />
          )
        })}
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
