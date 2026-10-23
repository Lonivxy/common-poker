import { motion } from 'motion/react'
import { PlayingCard } from './PlayingCard'

const TABLE_AREA = 'absolute left-[11%] right-[11%] top-[14%] bottom-[22%] portrait:left-[10%] portrait:right-[10%] portrait:top-[42%] portrait:max-sm:top-[44%] portrait:bottom-auto portrait:h-[max(8em,13%)]'

export function Table({ board, pot }) {
  return <>
    <div className={`${TABLE_AREA} rounded-[999px] border-[0.14em] border-ink/70 bg-felt`} />
    <div className="absolute inset-x-0 top-[18%] flex items-center justify-center gap-[0.8em] text-[2em] portrait:top-[38%] portrait:max-sm:top-[35%]">
      <div className="whitespace-nowrap font-mono text-ink">{pot}</div>
    </div>
    <div className={`${TABLE_AREA} grid place-items-center`}>
      <div className="flex gap-[0.4em] portrait:max-sm:gap-[0.25em] portrait:max-sm:text-[0.85em]">
        {Array.from({ length: 5 }, (_, i) => board[i] ? (
          <motion.div key={`${i}-${board[i].rank}-${board[i].suit}`} initial={{ opacity: 0, y: '-5.5em' }} animate={{ opacity: [0, 1, 1], y: ['-5.5em', '0.25em', '0em'] }} transition={{ delay: i < 3 ? i * 0.15 : 0, duration: 0.42, times: [0, 0.72, 1], ease: 'easeOut' }}>
            <PlayingCard size="md" {...board[i]} />
          </motion.div>
        ) : (
          <div key={i} className="h-[8em] w-[5.4em] shrink-0 rounded-[0.3em] border border-dashed border-ink/15" />
        ))}
      </div>
    </div>
  </>
}
