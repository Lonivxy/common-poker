import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { Table } from '../components/game/Table'
import { Seat, StatusBadge, BetBadge } from '../components/game/Seat'
import { ActionBar } from '../components/game/ActionBar'
import { HomePage } from './HomePage'

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
  const requestedPrivate = creating ? state?.private !== false : undefined
  const name = params.get('name') || sessionStorage.getItem('pokerName') || 'Player'

  useEffect(() => {
    let active = true
    let joined = false
    let ws
    const reject = (message) => {
      active = false
      ws?.close()
      navigate('/', { replace: true, state: { error: message, room: requestedRoom || '', private: requestedPrivate } })
    }
    // Defer opening so React StrictMode's setup/cleanup probe creates no ghost seat.
    const open = setTimeout(() => {
      const base = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
      const url = new URL('/ws', base)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(url)
      socket.current = ws
      let alive = Date.now()
      ws.onopen = () => ws.send(JSON.stringify({
        type: creating ? 'create' : 'join', room: requestedRoom, name,
        private: requestedPrivate,
      }))
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
  }, [requestedRoom, requestedPrivate, creating, name, navigate])

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
    <div className="game-page">
      <header className="game-header">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-ink-dim">{game?.room || (creating ? '' : roomId)}</span>
          <span className="rounded-full border border-ink/25 px-2 py-1 text-[10px] uppercase tracking-wider text-ink-dim">{game.private ? 'Private' : 'Public'}</span>
        </div>
        <details className="relative">
          <summary aria-label="Menu" className="grid min-h-11 min-w-11 cursor-pointer list-none place-content-center gap-[7px] [&::-webkit-details-marker]:hidden">
            <span className="h-px w-[22px] bg-ink" /><span className="h-px w-[22px] bg-ink" /><span className="h-px w-[22px] bg-ink" />
          </summary>
          <div className="absolute right-0 top-10 w-44 rounded-2xl border border-ink/70 bg-card-face p-2">
            <button onClick={() => navigate('/')} className="w-full rounded-full px-4 py-2 text-left text-sm text-suit-dark hover:bg-suit-dark/10">Leave</button>
          </div>
        </details>
      </header>
      <p className="sr-only" role="status">{game?.street}{game?.turn != null && ` · ${game.players[game.turn].name}'s turn`}</p>
      <main className="game-main">
        <div className="game-stage">
          <Table board={game?.board || []} pot={`$${(game?.pot ?? 0).toLocaleString()}`} />
          {seats.map(p => <div key={p.id} className={`table-seat table-seat-${p.side}`}>
            <Seat {...p} stack={p.stack} state={p.folded && game.street !== 'waiting' ? 'folded' : 'active'} active={p.index === game.turn} deadline={game.deadline} clockOffset={clock.offset} dealer={p.index === game.dealer}
              badges={<>{p.folded && game.street !== 'waiting' ? <StatusBadge status="x" /> : p.acted ? <StatusBadge status="d" /> : null}<BetBadge amount={p.bet || null} /></>} />
          </div>)}
        </div>
      </main>
      <footer className="game-footer">
        {error ? <p role="alert" className="mb-3 text-center text-sm text-red-300">{error}</p>
          : !connected && <p role="status" className="mb-3 text-center text-sm text-ink-dim">{status}</p>}
        {!error && connected && game.street === 'showdown' && <p role="status" className="game-result">{game.message}</p>}
        {canStart ? <div className="flex justify-center"><button disabled={!ready} title={!ready ? 'Waiting for another player with chips' : undefined} onClick={() => send({ type: 'start' })} className="action-button action-primary min-w-36">{game.street === 'waiting' ? 'Deal' : 'Next hand'}</button></div>
          : game?.legal && connected ? <ActionBar key={`${game.street}-${game.deadline}`} legal={game.legal} pot={game.pot} onAction={(action, amount) => send({ type: 'action', action, amount, turn: game.deadline })} />
            : null}
      </footer>
    </div>
  )
}
