import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Table } from "../components/game/Table"
import { Seat, StatusBadge, BetBadge } from "../components/game/Seat"
import { ActionBar } from "../components/game/ActionBar"

// ponytail: static scaffold data — replaced by WS state later
const OPPONENTS = [
  { side: "left", name: "WEST", stack: "$1,240", bet: 40, cards: [{ rank: "8", suit: "d" }, { rank: "8", suit: "c" }] },
  { side: "top", name: "NORTH", stack: "$980", bet: 20, cards: [{ rank: "Q", suit: "s" }, { rank: "J", suit: "d" }] },
  { side: "right", name: "EAST", stack: "$760", bet: 25, cards: [{}, {}], state: "folded" },
]

const HERO = { side: "hero", name: "SOUTH", stack: "$1,080", bet: 30, cards: [{ rank: "J", suit: "s" }, { rank: "10", suit: "h" }] }

const BOARD = [
  { rank: "A", suit: "s" },
  { rank: "K", suit: "d" },
  { rank: "7", suit: "h" },
  { rank: "2", suit: "c" },
  null,
]

// card dealt in when the undealt slot is clicked (preview only)
const RIVER = { rank: "9", suit: "s" }

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
  left: "left-[14%] top-[57%] -translate-x-1/2 -translate-y-1/2 portrait:left-[10%] portrait:top-[32%]",
  top: "left-[36%] top-[20%] -translate-x-1/2 -translate-y-1/2 portrait:top-[18%]",
  right: "left-[84%] top-[25%] -translate-x-1/2 -translate-y-1/2 portrait:left-[90%] portrait:top-[32%]",
  hero: "left-[45%] top-[72%] -translate-x-1/2 -translate-y-1/2",
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
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3 sm:px-6">
        <span className="font-mono text-sm text-ink-dim">{roomId}</span>
        <button type="button" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
          <MenuIcon />
        </button>
      </header>

      {/* menu panel */}
      {menuOpen && (
        <>
          {/* click-away layer */}
          <div className="absolute inset-0 z-20" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-12 right-4 z-30 flex w-44 flex-col rounded-2xl border-[1.3px] border-ink/70 bg-card-face p-2 shadow-[0_0.5em_2em_rgb(0_0_0_/_0.3)] sm:right-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full px-4 py-2 text-left text-sm font-medium text-suit-dark transition-colors hover:bg-suit-dark/10"
            >
              Leave
            </button>
          </div>
        </>
      )}

      {/* stage: table + seats scale as one unit via --stage-scale */}
      <main className="grid min-h-0 flex-1 place-items-center overflow-x-clip px-2 py-1 pb-[var(--stage-bottom-pad)]">
        <div
          style={{ fontSize: "var(--stage-scale)" }}
          className="relative aspect-[13/5] max-h-full w-[min(90vw,1200px)] portrait:aspect-[3/4] portrait:h-full portrait:w-auto"
        >
          <Table board={BOARD} pot="$540" next={RIVER} />
          {[...OPPONENTS, HERO].map((p) => (
            <div key={p.name} className={`absolute ${SEAT_POSITIONS[p.side]}`}>
              <Seat {...p} />
            </div>
          ))}
          {[...OPPONENTS, HERO].map((p) => (
            <div
              key={p.name}
              // north/east: bet sits to the left of the status badge
              className={`absolute z-10 flex items-center gap-[0.4em] ${(p.side === "top" || p.side === "right") && "flex-row-reverse"} ${BADGE_POSITIONS[p.side]}`}
            >
              <StatusBadge status={p.state === "folded" ? "x" : "d"} />
              <BetBadge amount={p.bet} />
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
