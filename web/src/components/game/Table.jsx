import { useState } from "react"
import { motion } from "motion/react"
import { PlayingCard } from "./PlayingCard"

/**
 * Felt + center content. Renders inside the stage (GamePage) whose font-size
 * (--stage-scale) drives all em-based sizing; felt is inset so seats can sit
 * around it on the stage.
 */
export function Table({ board, pot, next }) {
  // ponytail: preview-only deal trigger, remove when game state arrives
  const [riverDealt, setRiverDealt] = useState(false)
  return (
    <>
      {/* felt */}
      <div className="absolute left-[11%] right-[11%] top-[14%] bottom-[22%] rounded-[999px] border-[0.14em] border-ink/70 bg-felt portrait:left-[10%] portrait:right-[10%] portrait:top-[18%]" />

      {/* pot */}
      <div className="absolute inset-x-0 top-[18%] flex items-center justify-center gap-[0.8em] text-[2em] portrait:top-[24%]">
        <div className="whitespace-nowrap font-mono text-ink">{pot}</div>
      </div>

      {/* community cards */}
      <div className="absolute left-[11%] right-[11%] top-[14%] bottom-[22%] grid place-items-center portrait:left-[10%] portrait:right-[10%] portrait:top-[18%]">
        <div className="flex gap-[0.4em]">
          {board.map((c, i) =>
            c ? (
              <PlayingCard key={i} size="md" {...c} />
            ) : riverDealt && next ? (
              // dealt-in animation: card slides from the deck and settles with a small bounce
              <motion.div
                key={i}
                initial={{ y: "-5.5em" }}
                animate={{ opacity: [0, 1, 1], y: ["-5.5em", "0.25em", "0em"] }}
                transition={{ duration: 0.42, times: [0, 0.72, 1], ease: "easeOut" }}
              >
                <PlayingCard size="md" {...next} />
              </motion.div>
            ) : (
              // undealt slot — click deals the river (preview only)
              <button
                key={i}
                type="button"
                onClick={() => setRiverDealt(true)}
                aria-label="Deal river card"
                className="h-[8em] w-[5.4em] shrink-0 cursor-pointer rounded-[0.3em] border border-dashed border-ink/15 transition-colors hover:border-ink/35"
              />
            ),
          )}
        </div>
      </div>
    </>
  )
}
