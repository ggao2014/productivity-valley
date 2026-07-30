export type Difficulty = 'small' | 'medium' | 'large'
export type TabId = 'valley' | 'tasks' | 'bag'
export type RoomType =
  | 'living'
  | 'bedroom'
  | 'guest'
  | 'kitchen'
  | 'study'
  | 'storage'

export type FriendshipStage = 0 | 1 | 2 | 3
export type RomanceStage = 0 | 1 | 2 | 3 | 4

export interface Task {
  id: string
  title: string
  difficulty: Difficulty
  done: boolean
  createdAt: string
  completedAt?: string
}

export interface RoomInstance {
  id: string
  type: RoomType
  occupantId: string | null
}

export interface NpcProgress {
  friendshipPoints: number
  romancePoints: number
  romanceUnlocked: boolean
  livingAtHome: boolean
  met: boolean
  interactionsToday: number
}

export interface GiftItem {
  id: string
  qty: number
}

export interface GameState {
  coins: number
  bond: number
  tasks: Task[]
  rooms: RoomInstance[]
  npc: Record<string, NpcProgress>
  inventory: GiftItem[]
  lastDailyKey: string
  deficitDays: number
  toast: string | null
  selectedNpcId: string | null
  tab: TabId
}
