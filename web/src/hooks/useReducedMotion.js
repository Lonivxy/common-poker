import { useSyncExternalStore } from 'react'

const query = typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)')
const snapshot = () => query?.matches ?? false
const serverSnapshot = () => false
const subscribe = listener => {
  query?.addEventListener('change', listener)
  return () => query?.removeEventListener('change', listener)
}

// The installed Motion hook samples this setting only on mount.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot)
}
