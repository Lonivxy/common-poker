import { PlayingCard } from "./PlayingCard"

/**
 * Felt + center content. Renders inside the stage (GamePage) whose font-size
 * (--stage-scale) drives all em-based sizing; felt is inset so seats can sit
 * around it on the stage.
 */
export function Table({ board, pot }) {
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
            ) : (
              // undealt slot
              <div key={i} className="h-[8em] w-[5.4em] shrink-0 rounded-[0.3em] border border-dashed border-ink/15" />
            ),
          )}
        </div>
      </div>
    </>
  )
}
