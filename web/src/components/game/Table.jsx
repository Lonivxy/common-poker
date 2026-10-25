import { useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { motionTokens } from '../../motion'
import { useMotionPreference } from '../../hooks/useMotionPreference'
import { CardBack, PlayingCard } from './PlayingCard'

// Felt inset area. Portrait phones run the felt edge-to-edge (5px padding via
// the near-full-width stage); landscape/desktop untouched.
const TABLE_AREA = 'absolute left-[11%] right-[11%] top-[14%] bottom-[22%] portrait:max-sm:left-[5%] portrait:max-sm:right-[5%] portrait:min-sm:left-[10%] portrait:min-sm:right-[10%] portrait:top-[42%] portrait:max-sm:top-[44%] portrait:bottom-auto portrait:h-[max(13em,13%)]'

export function Table({ board, pot, potRef }) {
  const reduce = useMotionPreference()
  const potValue = useMotionValue(pot)
  const formattedPot = useTransform(potValue, value => `$${Math.round(value).toLocaleString()}`)
  const deckRef = useRef(null)
  const slotRefs = useRef([])
  const previousBoardLength = useRef(0)
  useEffect(() => {
    if (reduce) {
      potValue.set(pot)
      return
    }
    const animation = animate(potValue, pot, motionTokens.spring.smooth)
    return () => animation.stop()
  }, [pot, potValue, reduce])

  useLayoutEffect(() => {
    const previousLength = previousBoardLength.current
    previousBoardLength.current = board.length
    if (reduce || board.length <= previousLength) return

    const source = deckRef.current?.getBoundingClientRect()
    if (!source) return
    const sourceX = source.left + source.width / 2
    const sourceY = source.top + source.height / 2
    const controls = []

    for (let i = previousLength; i < board.length; i += 1) {
      const slot = slotRefs.current[i]?.getBoundingClientRect()
      const card = slotRefs.current[i]?.querySelector('[data-board-card]')
      if (!slot || !card) continue
      const dx = sourceX - (slot.left + slot.width / 2)
      const dy = sourceY - (slot.top + slot.height / 2)
      controls.push(animate(card, {
        x: [dx, dx * 0.55, 0],
        y: [dy, dy - 26, 0],
        rotate: [-12, -5, 0],
        rotateY: [58, 0],
        scale: [0.84, 1.04, 1],
      }, {
        duration: motionTokens.travel.card,
        delay: (i - previousLength) * motionTokens.stagger.deal,
        ease: motionTokens.ease.enter,
      }))
    }
    return () => controls.forEach(control => control.stop())
  }, [board.length, reduce])

  return <>
    <div className={`${TABLE_AREA} rounded-[999px] border-[0.14em] border-ink/70 bg-felt`} />
    <div ref={potRef} className="table-pot absolute inset-x-0 top-[18%] flex items-center justify-center gap-[0.8em] text-[2em] portrait:top-[38%] portrait:max-sm:top-[37%]" role="img" aria-label={`Pot $${pot.toLocaleString()}`}>
      <motion.span aria-hidden="true" className="whitespace-nowrap font-mono text-ink tabular-nums">{formattedPot}</motion.span>
    </div>
    <div className={`${TABLE_AREA} grid place-items-center`}>
      <div ref={deckRef} data-deck-source className="absolute left-[85%] top-[10%] z-0 h-[4.9em] w-[3.2em] opacity-85" aria-hidden="true">
        <div className="absolute inset-0 translate-x-[0.18em] translate-y-[0.12em] rotate-6"><CardBack size="sm" /></div>
        <CardBack tilt={-5} size="sm" />
      </div>
      <div className="flex gap-[0.4em] portrait:max-sm:gap-[0.25em] portrait:max-sm:text-[0.95em]">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} ref={node => { slotRefs.current[i] = node }} className="relative h-[8em] w-[5.4em] shrink-0">
            <AnimatePresence initial={false} mode="wait">
              {board[i] ? (
                <motion.div
                  key={`${board[i].rank}-${board[i].suit}`}
                  data-board-card
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? { opacity: 1, y: 0, transition: { duration: 0 } } : {
                    opacity: 0,
                    y: 4,
                    transition: { duration: motionTokens.duration.exit, ease: motionTokens.ease.exit },
                  }}
                  transition={{ opacity: { duration: reduce ? 0 : motionTokens.duration.standard } }}
                >
                  <PlayingCard size="md" {...board[i]} />
                </motion.div>
              ) : (
                <div key="empty" className="absolute inset-0 rounded-[0.3em] border border-dashed border-ink/15" />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  </>
}
