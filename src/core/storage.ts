import type { GameState } from './types'

const KEY = 'productivity-valley-v1'
const BACKUP_KEY = 'productivity-valley-backup-v1'
const CURRENT_SCHEMA_VERSION = 8

type PersistedState = Omit<
  GameState,
  | 'toast'
  | 'dialogue'
  | 'rewardFeedback'
  | 'taskReaction'
  | 'valleyRewardReady'
  | 'lastBuiltRoomId'
  | 'selectedNpcId'
  | 'selectedRoomId'
  | 'selectedEventId'
  | 'tab'
>

interface SaveEnvelope {
  schemaVersion: number
  savedAt: string
  state: Partial<PersistedState>
}

export interface LoadResult {
  state: Partial<GameState> | null
  source: 'empty' | 'primary' | 'backup' | 'corrupt'
  migrated: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function looksLikeState(value: unknown): value is Partial<PersistedState> {
  if (!isRecord(value)) return false
  if (!isFiniteNumber(value.coins) || !isFiniteNumber(value.bond)) return false
  if (!Array.isArray(value.tasks) || !Array.isArray(value.rooms)) return false
  if (!isRecord(value.npc) || !Array.isArray(value.inventory)) return false
  if (
    value.milestones !== undefined &&
    (!Array.isArray(value.milestones) ||
      !value.milestones.every((id) => typeof id === 'string'))
  ) return false
  for (const field of ['decorations', 'placedDecorations'] as const) {
    const items = value[field]
    if (
      items !== undefined &&
      (!Array.isArray(items) || !items.every((id) => typeof id === 'string'))
    ) return false
  }

  const tasksOk = value.tasks.every(
    (task) =>
      isRecord(task) &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      ['small', 'medium', 'large'].includes(String(task.difficulty)) &&
      typeof task.done === 'boolean' &&
      typeof task.createdAt === 'string' &&
      (task.completedAt === undefined || typeof task.completedAt === 'string') &&
      (task.awardedCoins === undefined || isFiniteNumber(task.awardedCoins)) &&
      (task.awardedBond === undefined || isFiniteNumber(task.awardedBond)),
  )
  const roomsOk = value.rooms.every(
    (room) =>
      isRecord(room) &&
      typeof room.id === 'string' &&
      ['living', 'bedroom', 'guest', 'kitchen', 'study', 'storage'].includes(
        String(room.type),
      ) &&
      (room.occupantId === null || typeof room.occupantId === 'string'),
  )
  const npcOk = Object.values(value.npc).every(
    (npc) =>
      isRecord(npc) &&
      isFiniteNumber(npc.friendshipPoints) &&
      isFiniteNumber(npc.romancePoints) &&
      typeof npc.romanceUnlocked === 'boolean' &&
      typeof npc.livingAtHome === 'boolean' &&
      typeof npc.met === 'boolean' &&
      isFiniteNumber(npc.interactionsToday) &&
      (npc.giftDiscoveries === undefined ||
        (isRecord(npc.giftDiscoveries) &&
          Object.values(npc.giftDiscoveries).every((reaction) =>
            ['liked', 'neutral', 'disliked'].includes(String(reaction)),
          ))) &&
      (npc.seenDialogueIds === undefined ||
        (Array.isArray(npc.seenDialogueIds) &&
          npc.seenDialogueIds.every((id) => typeof id === 'string'))) &&
      (npc.unlockedEventIds === undefined ||
        (Array.isArray(npc.unlockedEventIds) &&
          npc.unlockedEventIds.every((id) => typeof id === 'string'))),
  )
  const inventoryOk = value.inventory.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === 'string' &&
      isFiniteNumber(item.qty) &&
      item.qty > 0,
  )

  return tasksOk && roomsOk && npcOk && inventoryOk
}

function decode(raw: string): { state: Partial<GameState>; migrated: boolean } {
  const parsed: unknown = JSON.parse(raw)

  // v0.4 and earlier stored the state directly without an envelope.
  if (looksLikeState(parsed)) {
    return { state: parsed, migrated: true }
  }

  if (!isRecord(parsed) || typeof parsed.schemaVersion !== 'number') {
    throw new Error('无法识别的存档格式')
  }
  if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error('这个存档来自更新版本')
  }
  if (!looksLikeState(parsed.state)) {
    throw new Error('存档内容不完整')
  }

  return {
    state: parsed.state,
    migrated: parsed.schemaVersion < CURRENT_SCHEMA_VERSION,
  }
}

function persistedFrom(state: GameState): PersistedState {
  const {
    toast: _toast,
    dialogue: _dialogue,
    rewardFeedback: _reward,
    taskReaction: _taskReaction,
    valleyRewardReady: _valleyReward,
    lastBuiltRoomId: _lastBuiltRoom,
    selectedNpcId: _selectedNpc,
    selectedRoomId: _selectedRoom,
    selectedEventId: _selectedEvent,
    tab: _tab,
    ...persisted
  } = state
  return persisted
}

function envelopeFor(state: GameState): SaveEnvelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state: persistedFrom(state),
  }
}

export function loadState(): LoadResult {
  const primary = localStorage.getItem(KEY)
  const backup = localStorage.getItem(BACKUP_KEY)
  if (!primary && !backup) {
    return { state: null, source: 'empty', migrated: false }
  }

  if (primary) {
    try {
      const decoded = decode(primary)
      return { ...decoded, source: 'primary' }
    } catch {
      // Try the last known-good snapshot below.
    }
  }

  if (backup) {
    try {
      const decoded = decode(backup)
      return { ...decoded, source: 'backup' }
    } catch {
      // Both copies are unreadable.
    }
  }

  return { state: null, source: 'corrupt', migrated: false }
}

export function saveState(state: GameState): void {
  const previous = localStorage.getItem(KEY)
  if (previous) {
    try {
      decode(previous)
      localStorage.setItem(BACKUP_KEY, previous)
    } catch {
      // Never replace a valid backup with corrupt primary data.
    }
  }
  localStorage.setItem(KEY, JSON.stringify(envelopeFor(state)))
}

export function serializeState(state: GameState): string {
  return JSON.stringify(envelopeFor(state), null, 2)
}

export function parseImportedState(raw: string): Partial<GameState> {
  return decode(raw).state
}

export function clearState(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem(BACKUP_KEY)
}
