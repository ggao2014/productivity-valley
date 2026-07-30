import type { GameState } from './types'

const KEY = 'productivity-valley-v1'

export function loadState(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<GameState>
  } catch {
    return null
  }
}

export function saveState(state: GameState): void {
  const {
    toast: _t,
    selectedNpcId: _s,
    tab: _tab,
    ...persisted
  } = state
  localStorage.setItem(KEY, JSON.stringify(persisted))
}

export function clearState(): void {
  localStorage.removeItem(KEY)
}
