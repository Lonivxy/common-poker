import { useEffect, useState } from 'react'

export function Lobby({ onJoin, hasName }) {
  const [tables, setTables] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    let nextPoll
    let request
    let timeout
    const load = async () => {
      request = new AbortController()
      timeout = setTimeout(() => request.abort(), 5000)
      setLoading(true)
      try {
        const base = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
        const response = await fetch(new URL('/rooms', base), {
          signal: request.signal, cache: 'no-store',
        })
        if (!response.ok) throw new Error('Unable to load tables')
        const data = await response.json()
        if (!Array.isArray(data.rooms)) throw new Error('Invalid table list')
        if (active) {
          setTables(data.rooms)
          setError('')
        }
      } catch {
        if (active) {
          setTables([])
          setError('Cannot reach the lobby. Try refreshing or join by room number.')
        }
      } finally {
        clearTimeout(timeout)
        if (active) {
          setLoading(false)
          nextPoll = setTimeout(load, 5000)
        }
      }
    }
    load()
    return () => {
      active = false
      clearTimeout(nextPoll)
      clearTimeout(timeout)
      request?.abort()
    }
  }, [refresh])

  return <section aria-labelledby="lobby-heading" className="w-full max-w-xs border-t border-ink/20 pt-4">
    <div className="flex items-center justify-between gap-4">
      <h2 id="lobby-heading" className="text-xs font-medium uppercase tracking-[0.18em] text-ink-dim">Open tables</h2>
      <button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="min-h-11 px-2 text-xs text-ink-dim transition-colors hover:text-ink focus-visible:outline focus-visible:outline-accent disabled:opacity-40">
        {loading ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
    <p role="status" className="mb-2 text-xs leading-relaxed text-ink-dim">
      {tables === null ? 'Finding open tables…' : error || (tables.length === 0
        ? 'No open tables yet. Host one to get started.'
        : hasName ? 'Choose a table. The list updates automatically.' : 'Enter your name above, then choose a table.')}
    </p>
    {tables?.length > 0 && <ul aria-label="Joinable tables" className="max-h-64 divide-y divide-ink/15 overflow-y-auto">
      {tables.map(table => <li key={table.room} className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm tabular-nums">Table {table.room}</p>
          <p className="truncate text-xs text-ink-dim" title={table.host}>Hosted by {table.host}</p>
        </div>
        <span className="text-xs tabular-nums text-ink-dim" aria-label={`${table.players} of ${table.capacity} seats occupied`}>{table.players} / {table.capacity}</span>
        <button type="button" onClick={() => onJoin(table.room)} aria-label={`Join table ${table.room}`} className="min-h-11 rounded-full border border-ink/50 px-4 text-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-accent">Join</button>
      </li>)}
    </ul>}
  </section>
}
