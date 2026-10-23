import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import githubIcon from '../assets/github.svg'
import { Lobby } from '../components/Lobby'
import { AnimatePresence, motion } from 'motion/react'
import { queueRoomPassword } from '../roomAccess'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function HomePage({ pending = false }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [room, setRoom] = useState(state?.room || '')
  const [name, setName] = useState(sessionStorage.getItem('pokerName') || '')
  const [privateRoom, setPrivateRoom] = useState(state?.private !== false)
  const [passwordRequired, setPasswordRequired] = useState(Boolean(state?.passwordRequired))
  const [password, setPassword] = useState('')
  const nameInput = useRef(null)
  const reduce = useReducedMotion()
  const enter = (target, joinPassword = password) => {
    sessionStorage.setItem('pokerName', name.trim())
    if (target !== 'new') queueRoomPassword(target, joinPassword)
    navigate(`/game/${target}?name=${encodeURIComponent(name.trim())}`, {
      state: { room: target === 'new' ? room : target, private: target === 'new' ? privateRoom : undefined },
    })
  }
  const input = 'h-12 rounded-full border border-ink/40 bg-transparent px-6 text-center text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none'
  const joinTable = (target, protectedRoom) => {
    setRoom(target)
    setPassword('')
    setPasswordRequired(Boolean(protectedRoom))
    if (!name.trim()) nameInput.current?.focus()
    else if (protectedRoom) return
    else enter(target, '')
  }
  return <main aria-busy={pending} style={{ paddingLeft: 'max(1.5rem, env(safe-area-inset-left))', paddingRight: 'max(1.5rem, env(safe-area-inset-right))' }} className="flex min-h-dvh flex-col items-center justify-center gap-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+4rem)] sm:gap-8">
    <h1 className="text-[clamp(2.6rem,9vmin,4.5rem)] leading-none font-mono">Common Poker</h1>
    <fieldset disabled={pending} className="flex w-full max-w-xs flex-col gap-3">
      <input ref={nameInput} aria-label="Your name" maxLength={20} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className={input} />
      <input aria-label="Room number" inputMode="numeric" maxLength={6} placeholder="Room number" value={room} onChange={e => { setRoom(e.target.value.replace(/\D/g, '')); setPassword(''); setPasswordRequired(false) }} className={input} />
      <AnimatePresence initial={false}>
        {passwordRequired && <motion.div key="join-password" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduce ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.15 }} className="flex flex-col gap-2">
          <input autoFocus type="password" autoComplete="off" aria-label="Room password" maxLength={64} placeholder="Room password" value={password} onChange={event => setPassword(event.target.value)} className={`${input} w-full`}
            onKeyDown={event => { if (event.key === 'Enter' && name.trim() && room) enter(room) }} />
        </motion.div>}
      </AnimatePresence>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/25 px-4 py-3 text-left">
        <input type="checkbox" checked={privateRoom} onChange={e => setPrivateRoom(e.target.checked)} className="mt-1 size-4 shrink-0 accent-accent" />
        <span className="min-w-0 text-sm">Private room</span>
      </label>
      <div className="flex gap-3">
        <button disabled={!name.trim()} onClick={() => enter('new')} className="h-12 flex-1 rounded-full border border-ink/70 disabled:opacity-40">Host</button>
        <button disabled={!name.trim() || !room.length} onClick={() => enter(room)} className="h-12 flex-1 rounded-full bg-accent text-accent-ink disabled:opacity-40">Join</button>
      </div>
      {state?.error && <p role="alert" className="text-center text-sm text-red-300">{state.error}</p>}
    </fieldset>
    {pending ? <p role="status" className="text-sm text-ink-dim">Connecting to table…</p> : <Lobby onJoin={joinTable} />}
    <a href="https://github.com/Moreallure/common-poker" target="_blank" rel="noreferrer" aria-label="GitHub" className="mt-auto self-end size-6 opacity-60"><img src={githubIcon} alt="" className="size-full invert" /></a>
  </main>
}
