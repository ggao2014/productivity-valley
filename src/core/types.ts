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
export type DialogueKind =
  | 'chat'
  | 'heart'
  | 'romance'
  | 'giftLiked'
  | 'giftNeutral'
  | 'giftDisliked'
  | 'tea'
  | 'invite'
export type DialogueTone = 'neutral' | 'warm' | 'shy' | 'worried' | 'annoyed'
export type OnboardingStep = 0 | 1 | 2 | 3 | 4
export type GiftReaction = 'liked' | 'neutral' | 'disliked'
export type MilestoneId =
  | 'first_task'
  | 'tasks_10'
  | 'tasks_25'
  | 'first_room'
  | 'first_friend'
  | 'first_partner'

export interface DialogueState {
  entryId: string
  npcId: string
  kind: DialogueKind
  text: string
  tone: DialogueTone
}

export interface RewardFeedback {
  id: string
  coins: number
  bond: number
}

export interface TaskReaction {
  id: string
  taskId: string
  npcId: string
  text: string
}

export interface Task {
  id: string
  title: string
  difficulty: Difficulty
  done: boolean
  createdAt: string
  completedAt?: string
  awardedCoins?: number
  awardedBond?: number
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
  giftDiscoveries: Record<string, GiftReaction>
  seenDialogueIds: string[]
  unlockedEventIds: string[]
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
  decorations: string[]
  placedDecorations: string[]
  milestones: MilestoneId[]
  lastDailyKey: string
  deficitDays: number
  toast: string | null
  dialogue: DialogueState | null
  rewardFeedback: RewardFeedback | null
  taskReaction: TaskReaction | null
  valleyRewardReady: boolean
  lastBuiltRoomId: string | null
  onboardingStep: OnboardingStep
  selectedNpcId: string | null
  selectedRoomId: string | null
  selectedEventId: string | null
  tab: TabId
}
