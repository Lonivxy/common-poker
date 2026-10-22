import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { PlayingCard } from './PlayingCard'

export function Table({ board, pot }) {
  const reduce = useReducedMotion()
  return <>
    <div className="table-felt" aria-hidden />
    <div className="table-pot" aria-label={`Pot ${pot}`}>
      <motion.span key={pot} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }}>{pot}</motion.span>
    </div>
    <div className="table-board" aria-label="Community cards">
      {Array.from({ length: 5 }, (_, i) => board[i] ? <motion.div
        key={`${i}-${board[i].rank}-${board[i].suit}`}
        initial={{ opacity: 0, transform: reduce ? 'none' : 'translateY(-10px)' }}
        animate={{ opacity: 1, transform: 'none' }}
        transition={{ delay: reduce ? 0 : i < 3 ? i * 0.05 : 0, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      ><PlayingCard size="md" {...board[i]} /></motion.div>
        : <div key={i} className="board-placeholder" aria-hidden />)}
    </div>
  </>
}
