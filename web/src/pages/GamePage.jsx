import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { Table } from '../components/game/Table'
import { Seat, StatusBadge, BetBadge } from '../components/game/Seat'
import { ActionBar } from '../components/game/ActionBar'
import { HomePage } from './HomePage'

const POSITIONS = {
  left: 'left-0 top-[48%] -translate-y-1/2 portrait:left-[2%] portrait:top-[9%] portrait:translate-y-0',
  top: 'left-1/2 top-[-6%] -translate-x-1/2 portrait:top-[1%]',
  right: 'right-0 top-[48%] -translate-y-1/2 portrait:right-[2%] portrait:top-[9%] portrait:translate-y-0',
  hero: 'bottom-[1%] left-1/2 -translate-x-1/2',
}
const BADGES = {
  left: 'left-[14%] top-[57%] portrait:left-[10%] portrait:top-[32%]',
  top: 'left-[36%] top-[20%] portrait:top-[18%]',
  right: 'left-[84%] top-[25%] portrait:left-[90%] portrait:top-[32%]',
  hero: 'left-[45%] top-[72%]',
}

export function GamePage() {
  const { roomId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const socket = useRef(null)
  const [game, setGame] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Connecting…')
  const [clock, setClock] = useState(() => ({ now: Date.now(), offset: 0 }))
  const creating = roomId === 'new'
  const requestedRoom = creating ? state?.room || undefined : roomId
  const name = params.get('name') || sessionStorage.getItem('pokerName') || 'Player'

  useEffect(() => {
    let active = true
    let joined = false
    let ws
    const reject = (message) => {
      active = false
      ws?.close()
      navigate('/', { replace: true, state: { error: message, room: requestedRoom || '' } })
    }
    // Defer opening so React StrictMode's setup/cleanup probe creates no ghost seat.
    const open = setTimeout(() => {
      const base = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
      const url = new URL('/ws', base)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(url)
      socket.current = ws
      let alive = Date.now()
      ws.onopen = () => ws.send(JSON.stringify({ type: creating ? 'create' : 'join', room: requestedRoom, name }))
      ws.onmessage = (event) => {
        if (!active) return
        alive = Date.now()
        const data = JSON.parse(event.data)
        if (data.type === 'ping') { ws.send(JSON.stringify({ type: 'pong' })); return }
        if (data.type === 'error') {
          if (!joined) reject(data.message)
          else setError(data.message)
          return
        }
        if (data.type === 'state') {
          joined = true
          setGame(data)
          setStatus('Connected')
          setClock({ now: Date.now(), offset: data.serverTime * 1000 - Date.now() })
          setError('')
          // Keep this connection alive while making the address shareable.
          if (creating) window.history.replaceState(window.history.state, '', `/game/${data.room}`)
        }
      }
      ws.onerror = () => {
        if (!active) return
        if (!joined) reject('Cannot reach the game server.')
        else setError('Cannot reach the game server.')
      }
      ws.onclose = () => {
        if (!active) return
        if (!joined) reject('Cannot join the room.')
        else setStatus('Disconnected — return home to join again')
      }
      ws.watchdog = setInterval(() => {
        if (Date.now() - alive > 35000) ws.close()
      }, 1000)
    }, 0)
    return () => { active = false; clearTimeout(open); if (ws) { clearInterval(ws.watchdog); ws.close() } }
  }, [requestedRoom, creating, name, navigate])

  const send = (data) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(data))
  }
  const connected = status === 'Connected'
  const hero = game?.players.findIndex(p => p.id === game.you) ?? 0
  const seats = game?.players.map((p, i) => ({ ...p, index: i, side: ['hero', 'left', 'top', 'right'][(i - hero + 4) % 4] })).filter(p => p.connected) || []
  const canStart = connected && game?.host === game?.you && ['waiting', 'showdown'].includes(game?.street)
  const ready = game?.players.filter(p => p.connected && p.stack > 0).length >= 2

  if (!game) return <HomePage pending />

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3 sm:px-6">
        <span className="font-mono text-sm text-ink-dim">{game?.room || (creating ? '' : roomId)}</span>
        <details className="relative">
          <summary aria-label="Menu" className="flex cursor-pointer list-none flex-col gap-[7px] py-2 [&::-webkit-details-marker]:hidden">
            <span className="h-px w-[22px] bg-ink" /><span className="h-px w-[22px] bg-ink" /><span className="h-px w-[22px] bg-ink" />
          </summary>
          <div className="absolute right-0 top-10 w-44 rounded-2xl border border-ink/70 bg-card-face p-2">
            <button onClick={() => navigate('/')} className="w-full rounded-full px-4 py-2 text-left text-sm text-suit-dark hover:bg-suit-dark/10">Leave</button>
          </div>
        </details>
      </header>
      <p className="sr-only" role="status">{game?.street}{game?.turn != null && ` · ${game.players[game.turn].name}'s turn`}</p>
      <main className="grid min-h-0 flex-1 place-items-center overflow-x-clip px-2 py-1 pb-[var(--stage-bottom-pad)]">
        <div style={{ fontSize: 'var(--stage-scale)' }} className="relative aspect-[13/5] max-h-full w-[min(90vw,1200px)] portrait:aspect-[3/4] portrait:h-full portrait:w-auto">
          <Table board={game?.board || []} pot={`$${(game?.pot ?? 0).toLocaleString()}`} />
          {seats.map(p => <div key={p.id} className={`absolute ${POSITIONS[p.side]}`}>
            <Seat {...p} stack={p.stack} state={p.folded && game.street !== 'waiting' ? 'folded' : 'active'} active={p.index === game.turn} deadline={game.deadline} clockOffset={clock.offset} dealer={p.index === game.dealer} />
          </div>)}
          {seats.map(p => <div key={p.id} className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.4em] ${p.side === 'top' || p.side === 'right' ? 'flex-row-reverse' : ''} ${BADGES[p.side]}`}>
            {p.folded && game.street !== 'waiting' ? <StatusBadge status="x" /> : p.acted ? <StatusBadge status="d" /> : null}
            <BetBadge amount={p.bet || null} />
          </div>)}
        </div>
      </main>
      <footer className="absolute inset-x-0 bottom-0 z-20 px-4 pb-3 sm:px-6">
        {error ? <p role="alert" className="mb-3 text-center text-sm text-red-300">{error}</p>
          : !connected && <p role="status" className="mb-3 text-center text-sm text-ink-dim">{status}</p>}
        {!error && connected && game.street === 'showdown' && <p role="status" className="absolute bottom-3 left-4 right-40 break-words text-left text-sm text-ink sm:left-6">{game.message}</p>}
        {canStart ? <div className="flex justify-end"><button disabled={!ready} title={!ready ? 'Waiting for another player with chips' : undefined} onClick={() => send({ type: 'start' })} className="rounded-full bg-accent px-7 py-3 text-accent-ink disabled:opacity-40">{game.street === 'waiting' ? 'Deal' : 'Next hand'}</button></div>
          : game?.legal && connected ? <ActionBar key={`${game.street}-${game.deadline}`} legal={game.legal} pot={game.pot} onAction={(action, amount) => send({ type: 'action', action, amount, turn: game.deadline })} />
            : null}
      </footer>
    </div>
  )
}
