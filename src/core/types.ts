export type Difficulty = 'small' | 'medium' | 'large'
export type TabId = 'valley' | 'tasks'
export type RoomType =
  | 'living'
  | 'bedroom'
  | 'guest'
  | 'kitchen'
  | 'study'
  | 'storage'
export type RoomLevel = 1 | 2 | 3 | 4
export type CourtyardLevel = 1 | 2 | 3 | 4
export type CourtyardLandscapeId = 'open' | 'pond' | 'old_tree' | 'kitchen_garden'
export type BedroomSection = 'main' | 'leftWing' | 'rightWing'

export type FriendshipStage = 0 | 1 | 2 | 3
export type RomanceStage = 0 | 1 | 2 | 3 | 4
export type DialogueKind =
  | 'meet'
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
  kind?: 'todo' | 'habit' | 'project_block' | 'project_milestone' | 'project_complete'
  title?: string
  progressBefore?: number
  progressAfter?: number
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
  category?: TaskCategory
}

export type TaskCategory = 'work' | 'study' | 'life' | 'health' | 'errand'

export type PlanSlot = 'morning' | 'afternoon' | 'evening' | 'anytime'

export type PlanTarget =
  | { kind: 'task'; id: string }
  | { kind: 'habit'; id: string }
  | { kind: 'block'; projectId: string; blockId: string }

export interface PlanAssignment {
  dayKey: string
  slot: PlanSlot
  target: PlanTarget
}

export type HabitMode = 'check' | 'count'
export type HabitScheduleType = 'daily' | 'weekdays' | 'selected' | 'weekly'

export interface HabitSchedule {
  type: HabitScheduleType
  days?: number[]
  weeklyTarget?: number
}

export interface HabitEntry {
  dayKey: string
  count: number
  completedAt?: string
  awardedCoins?: number
  awardedBond?: number
}

export interface Habit {
  id: string
  title: string
  mode: HabitMode
  targetCount: number
  schedule: HabitSchedule
  active: boolean
  createdAt: string
  entries: HabitEntry[]
  weeklyRewardKeys: string[]
  category?: TaskCategory
}

export type ProjectSize = 'small' | 'medium' | 'large'
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface ProjectBlock {
  id: string
  title: string
  difficulty: Difficulty
  done: boolean
  createdAt: string
  completedAt?: string
  awardedCoins?: number
  awardedBond?: number
}

export type ProjectMilestone = 25 | 50 | 75 | 100

export interface Project {
  id: string
  title: string
  size: ProjectSize
  status: ProjectStatus
  createdAt: string
  dueDate?: string
  blocks: ProjectBlock[]
  awardedMilestones: ProjectMilestone[]
  category?: TaskCategory
}

export interface RoomInstance {
  id: string
  type: RoomType
  occupantId: string | null
  wingOccupantIds?: [string | null, string | null]
  level?: RoomLevel
}

export interface NpcProgress {
  friendshipPoints: number
  romancePoints: number
  romanceUnlocked: boolean
  livingAtHome: boolean
  met: boolean
  /** True after the first real interaction (chat / gift / etc.). */
  interacted: boolean
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
  facilityMigrationVersion: number
  coins: number
  bond: number
  tasks: Task[]
  habits: Habit[]
  projects: Project[]
  plans: PlanAssignment[]
  habitRewardSnapshots: Record<string, string[]>
  rooms: RoomInstance[]
  courtyardLevel: CourtyardLevel
  npc: Record<string, NpcProgress>
  inventory: GiftItem[]
  decorations: string[]
  placedDecorations: string[]
  ownedLandscapes: CourtyardLandscapeId[]
  courtyardLandscape: CourtyardLandscapeId
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
