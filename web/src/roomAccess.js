// One-use, memory-only handoff: passwords never enter URLs or browser storage.
let pending = null

export function queueRoomPassword(room, password) {
  pending = { room, password }
}

export function takeRoomPassword(room) {
  const password = pending?.room === room ? pending.password : ''
  pending = null
  return password
}
