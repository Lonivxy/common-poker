import { useParams } from "react-router"
import { Table } from "../components/game/Table"
import { Seat, StatusBadge } from "../components/game/Seat"
import { ActionBar } from "../components/game/ActionBar"

// ponytail: static scaffold data — replaced by WS state later
const OPPONENTS = [
  { side: "left", name: "WEST", stack: "$1,240", cards: [{}, {}] },
  { side: "top", name: "NORTH", stack: "$980", cards: [{}, {}] },
  { side: "right", name: "EAST", stack: "$760", cards: [{}, {}], state: "folded" },
]

const HERO = { side: "hero", name: "SOUTH", stack: "$1,080", cards: [{ rank: "J", suit: "s" }, { rank: "10", suit: "h" }] }

const BOARD = [
  { rank: "A", suit: "s" },
  { rank: "K", suit: "d" },
  { rank: "7", suit: "h" },
  { rank: "2", suit: "c" },
  null,
]

// Seat anchor points (% of stage) — tweak here, keyed by side.
const SEAT_POSITIONS = {
  left: "left-0 top-[48%] -translate-y-1/2 portrait:left-[2%] portrait:top-[9%] portrait:translate-y-0",
  top: "left-1/2 top-[-6%] -translate-x-1/2 portrait:top-[1%]",
  right: "right-0 top-[48%] -translate-y-1/2 portrait:right-[2%] portrait:top-[9%] portrait:translate-y-0",
  hero: "bottom-[1%] left-1/2 -translate-x-1/2",
}

// Status badge centers anchored on the felt border (felt insets: x 11%/89%,
// y 14%/78% landscape; 10%/90%, 18%/78% portrait).
const BADGE_POSITIONS = {
  left: "left-[11.5%] top-[55%] -translate-x-1/2 -translate-y-1/2 portrait:left-[10%] portrait:top-[32%]",
  top: "left-[37.6%] top-[14%] -translate-x-1/2 -translate-y-1/2 portrait:top-[18%]",
  right: "left-[86.5%] top-[27%] -translate-x-1/2 -translate-y-1/2 portrait:left-[90%] portrait:top-[32%]",
  hero: "left-[45%] top-[78%] -translate-x-1/2 -translate-y-1/2",
}

function MenuIcon() {
  return (
    <div className="flex flex-col gap-[7px]" aria-hidden>
      <div className="h-px w-[22px] bg-ink" />
      <div className="h-px w-[22px] bg-ink" />
      <div className="h-px w-[22px] bg-ink" />
    </div>
  )
}

export function GamePage() {
  const { roomId } = useParams()

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3 sm:px-6">
        <span className="font-mono text-sm text-ink-dim">{roomId}</span>
        <button type="button" aria-label="Menu">
          <MenuIcon />
        </button>
      </header>

      {/* stage: table + seats scale as one unit via --stage-scale */}
      <main className="grid min-h-0 flex-1 place-items-center overflow-x-clip px-2 py-1 pb-[var(--stage-bottom-pad)]">
        <div
          style={{ fontSize: "var(--stage-scale)" }}
          className="relative aspect-[13/5] max-h-full w-[min(90vw,1200px)] portrait:aspect-[3/4] portrait:h-full portrait:w-auto"
        >
          <Table board={BOARD} pot="$540" />
          {[...OPPONENTS, HERO].map((p) => (
            <div key={p.name} className={`absolute ${SEAT_POSITIONS[p.side]}`}>
              <Seat {...p} />
            </div>
          ))}
          {[...OPPONENTS, HERO].map((p) => (
            <div key={p.name} className={`absolute z-10 ${BADGE_POSITIONS[p.side]}`}>
              <StatusBadge status={p.state === "folded" ? "x" : "d"} />
            </div>
          ))}
        </div>
      </main>

      {/* action bar overlays the stage; main reserves space via --stage-bottom-pad */}
      <footer className="absolute inset-x-0 bottom-0 z-20 px-4 pb-3 sm:px-6">
        <ActionBar />
      </footer>
    </div>
  )
}
