import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import githubIcon from '../assets/github.svg'

export function HomePage({ pending = false }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [room, setRoom] = useState(state?.room || '')
  const [name, setName] = useState(localStorage.getItem('pokerName') || '')
  const enter = (target) => {
    localStorage.setItem('pokerName', name.trim())
    navigate(`/game/${target}?name=${encodeURIComponent(name.trim())}`, { state: { room: target === 'new' ? room : target } })
  }
  const input = 'h-12 rounded-full border border-ink/40 bg-transparent px-6 text-center text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none'
  return <main aria-busy={pending} className="flex h-dvh flex-col items-center justify-center gap-8 px-6">
    <h1 className="text-[clamp(2.6rem,9vmin,4.5rem)] leading-none font-mono">Common Poker</h1>
    <fieldset disabled={pending} className="flex w-full max-w-xs flex-col gap-3">
      <input aria-label="Your name" maxLength={20} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className={input} />
      <input aria-label="Room number" inputMode="numeric" maxLength={6} placeholder="Room number" value={room} onChange={e => setRoom(e.target.value.replace(/\D/g, ''))} className={input} />
      <div className="flex gap-3">
        <button disabled={!name.trim()} onClick={() => enter('new')} className="h-12 flex-1 rounded-full border border-ink/70 disabled:opacity-40">Host</button>
        <button disabled={!name.trim() || !room.length} onClick={() => enter(room)} className="h-12 flex-1 rounded-full bg-accent text-accent-ink disabled:opacity-40">Join</button>
      </div>
      {state?.error && <p role="alert" className="text-center text-sm text-red-300">{state.error}</p>}
    </fieldset>
    <a href="https://github.com/Moreallure/common-poker" target="_blank" rel="noreferrer" aria-label="GitHub" className="fixed right-5 bottom-5 portrait:bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] size-6 opacity-60 transition-opacity hover:opacity-100"><img src={githubIcon} alt="" className="size-full invert" /></a>
  </main>
}
