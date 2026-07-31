import {
  BASE_DAILY_COST,
  FRIENDSHIP_THRESHOLDS,
  ROMANCE_THRESHOLDS,
  ROOM_DEFS,
} from './constants'
import type {
  FriendshipStage,
  GameState,
  RomanceStage,
  RoomInstance,
  Task,
} from './types'

export function localDayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function taskCompletedOn(task: Task, dayKey = localDayKey()): boolean {
  return Boolean(
    task.done &&
      task.completedAt &&
      localDayKey(new Date(task.completedAt)) === dayKey,
  )
}

export function todayTaskProgress(tasks: Task[], dayKey = localDayKey()) {
  return tasks.filter((task) => taskCompletedOn(task, dayKey)).reduce(
    (progress, task) => ({
      completed: progress.completed + 1,
      coins: progress.coins + (task.awardedCoins ?? 0),
      bond: progress.bond + (task.awardedBond ?? 0),
    }),
    { completed: 0, coins: 0, bond: 0 },
  )
}

export function activeDayStreak(tasks: Task[], now = new Date()): number {
  const activeDays = new Set(
    tasks
      .filter((task) => task.done && task.completedAt)
      .map((task) => localDayKey(new Date(task.completedAt!))),
  )
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!activeDays.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function friendshipStage(points: number): FriendshipStage {
  if (points >= FRIENDSHIP_THRESHOLDS[3]) return 3
  if (points >= FRIENDSHIP_THRESHOLDS[2]) return 2
  if (points >= FRIENDSHIP_THRESHOLDS[1]) return 1
  return 0
}

export function romanceStage(
  points: number,
  unlocked: boolean,
  living: boolean,
): RomanceStage {
  if (!unlocked) return 0
  if (living && points >= ROMANCE_THRESHOLDS[4]) return 4
  if (points >= ROMANCE_THRESHOLDS[3]) return 3
  if (points >= ROMANCE_THRESHOLDS[2]) return 2
  if (points >= ROMANCE_THRESHOLDS[1]) return 1
  return 0
}

export function hasRoomType(rooms: RoomInstance[], type: string): boolean {
  return rooms.some((r) => r.type === type)
}

export function emptyBeds(rooms: RoomInstance[]): number {
  return rooms.filter((r) => {
    const def = ROOM_DEFS.find((d) => d.type === r.type)
    return (def?.capacity ?? 0) > 0 && !r.occupantId
  }).length
}

export function partnerIds(state: GameState): string[] {
  return Object.entries(state.npc)
    .filter(([, p]) => p.livingAtHome)
    .map(([id]) => id)
}

export function dailyCostPerPerson(rooms: RoomInstance[]): number {
  let food: number = BASE_DAILY_COST.food
  let drink: number = BASE_DAILY_COST.drink
  let misc: number = BASE_DAILY_COST.misc
  if (hasRoomType(rooms, 'kitchen')) food = food * 0.8
  if (hasRoomType(rooms, 'storage')) misc = Math.max(0, misc - 1)
  return food + drink + misc
}

export function totalDailyMaintenance(state: GameState): number {
  const n = partnerIds(state).length
  return Math.round(dailyCostPerPerson(state.rooms) * n * 10) / 10
}

export function canInvite(state: GameState, npcId: string): boolean {
  const p = state.npc[npcId]
  if (!p || p.livingAtHome) return false
  const r = romanceStage(p.romancePoints, p.romanceUnlocked, false)
  return r >= 3 && emptyBeds(state.rooms) >= 1 && state.coins >= 20
}

export function roomName(type: string): string {
  return ROOM_DEFS.find((d) => d.type === type)?.name ?? type
}
