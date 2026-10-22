import { useState } from "react"
import { useNavigate } from "react-router"
import githubIcon from "../assets/github.svg"

const ROOM_PATTERN = "[0-9]*"

export function HomePage() {
  const navigate = useNavigate()
  const [room, setRoom] = useState("")

  const target = room.trim() ? `/game/${room.trim()}` : null

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-10 px-6">
      <h1 className="text-[clamp(2.6rem,9vmin,4.5rem)] leading-none font-mono text-ink">Common Poker</h1>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="text"
          inputMode="numeric"
          pattern={ROOM_PATTERN}
          placeholder="Room number"
          value={room}
          onChange={(e) => setRoom(e.target.value.replace(/\D/g, ""))}
          className="h-12 rounded-full border-[1.3px] border-ink/40 bg-transparent px-6 text-center font-mono text-lg text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/game/${Math.floor(1000 + Math.random() * 9000)}?host=1`)}
            className="h-12 flex-1 rounded-full border-[1.3px] border-ink/70 font-medium text-ink transition-colors hover:bg-ink/10"
          >
            Host
          </button>
          <button
            type="button"
            disabled={!target}
            onClick={() => navigate(target)}
            className="h-12 flex-1 rounded-full border-[1.3px] border-ink/70 bg-accent font-medium text-accent-ink transition-colors hover:brightness-105 disabled:pointer-events-none disabled:opacity-40"
          >
            Join
          </button>
        </div>
      </div>

      <a
        href="https://github.com/Moreallure/common-poker"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        className="fixed right-5 bottom-5 size-6 opacity-60 transition-opacity hover:opacity-100"
      >
        <img src={githubIcon} alt="" className="size-full invert" />
      </a>
    </main>
  )
}
