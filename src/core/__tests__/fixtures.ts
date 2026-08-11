import type { GameState, NpcProgress } from '../types'
import { NPC_DEFS } from '../npcs'

export function npcProgress(
  overrides: Partial<NpcProgress> = {},
): NpcProgress {
  return {
    friendshipPoints: 0,
    romancePoints: 0,
    romanceUnlocked: false,
    livingAtHome: false,
    met: true,
    interactionsToday: 0,
    giftDiscoveries: {},
    seenDialogueIds: [],
    unlockedEventIds: [],
    ...overrides,
  }
}

export function gameState(overrides: Partial<GameState> = {}): GameState {
  const defaultNpc = Object.fromEntries(
    NPC_DEFS.map((npc) => [npc.id, npcProgress({ met: npc.starter })]),
  )
  return {
    facilityMigrationVersion: 1,
    coins: 40,
    bond: 2,
    tasks: [],
    habits: [],
    projects: [],
    plans: [],
    habitRewardSnapshots: {},
    rooms: [{ id: 'living-1', type: 'living', occupantId: null }],
    courtyardLevel: 1,
    inventory: [],
    decorations: [],
    placedDecorations: [],
    ownedLandscapes: ['open'],
    courtyardLandscape: 'open',
    milestones: [],
    lastDailyKey: '2026-07-30',
    deficitDays: 0,
    toast: null,
    dialogue: null,
    rewardFeedback: null,
    taskReaction: null,
    valleyRewardReady: false,
    lastBuiltRoomId: null,
    onboardingStep: 0,
    selectedNpcId: null,
    selectedRoomId: null,
    selectedEventId: null,
    tab: 'valley',
    ...overrides,
    npc: { ...defaultNpc, ...overrides.npc },
  }
}

export function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => data.delete(key),
    setItem: (key, value) => data.set(key, String(value)),
  }
}
