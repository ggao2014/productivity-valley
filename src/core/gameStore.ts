import { create } from 'zustand'
import {
  BOND_DAILY_CAP,
  DAILY_LOGIN_BONUS,
  DECORATION_DEFS,
  GIFT_DEFS,
  HOME_FEE,
  INTERACTIONS_PER_NPC_PER_DAY,
  COURTYARD_LEVELS,
  ROOM_DEFS,
  ROOM_UPGRADE_COSTS,
  STARTING_COINS,
  TASK_REWARDS,
} from './constants'
import {
  canInvite,
  emptyBeds,
  friendshipStage,
  hasRoomType,
  localDayKey,
  partnerIds,
  romanceStage,
  taskCompletedOn,
  totalDailyMaintenance,
} from './economy'
import { NPC_DEFS } from './npcs'
import { completionReactionFor, dialogueFor } from './dialogue'
import { eligibleEventIds } from './events'
import { loadState, parseImportedState, saveState } from './storage'
import { earnedMilestones, giftCapacity, inventoryCount, valleyStage } from './growth'
import {
  availableLandscape,
  COURTYARD_LANDSCAPE_DEFS,
  courtyardLandscapeDef,
} from './courtyardLandscapes'
import { trackBetaEvent } from './beta'
import {
  removePlansForBlock,
  removePlansForProject,
  removePlansForTarget,
  upsertPlan,
} from './plan'
import {
  assignResident,
  canAddRoom,
  canUpgradeBedroomToCourtyard,
  courtyardCapacityUsed,
  maxRoomLevel,
  minimumCourtyardLevel,
  removeResident,
  roomResidentIds,
  roomTypeLimitReached,
  isBuiltInRoom,
} from './roomRules'
import {
  crossedMilestones,
  HABIT_REWARD,
  HABIT_REWARD_SLOTS,
  HABIT_WEEKLY_REWARD,
  habitEntryFor,
  habitWeeklyProgress,
  mondayKey,
  nextBlockReward,
  PROJECT_REWARDS,
  projectProgress,
} from './productivity'
import type {
  DialogueKind,
  Difficulty,
  GameState,
  GiftReaction,
  NpcProgress,
  OnboardingStep,
  PlanSlot,
  PlanTarget,
  RoomInstance,
  TabId,
  Task,
  Habit,
  HabitMode,
  HabitSchedule,
  ProjectSize,
  TaskCategory,
  CourtyardLevel,
  CourtyardLandscapeId,
} from './types'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function initialNpc(): Record<string, NpcProgress> {
  const map: Record<string, NpcProgress> = {}
  for (const n of NPC_DEFS) {
    map[n.id] = {
      friendshipPoints: 0,
      romancePoints: 0,
      romanceUnlocked: false,
      livingAtHome: false,
      met: n.starter,
      interacted: false,
      interactionsToday: 0,
      giftDiscoveries: {},
      seenDialogueIds: [],
      unlockedEventIds: [],
    }
  }
  return map
}

function inferInteracted(progress: NpcProgress): boolean {
  if (progress.interacted) return true
  if (progress.friendshipPoints > 0 || progress.romancePoints > 0) return true
  if (progress.romanceUnlocked || progress.livingAtHome) return true
  if (Object.keys(progress.giftDiscoveries).length > 0) return true
  if (progress.seenDialogueIds.length > 0) return true
  if (progress.unlockedEventIds.length > 0) return true
  return false
}

function reconcileGiftDiscoveries(
  npcId: string,
  discoveries: Record<string, GiftReaction> | undefined,
): Record<string, GiftReaction> {
  return Object.fromEntries(
    Object.entries(discoveries ?? {}).map(([giftId, previousReaction]) => {
      const gift = GIFT_DEFS.find((item) => item.id === giftId)
      if (!gift) return [giftId, previousReaction]
      const reaction: GiftReaction = gift.likedBy.includes(npcId)
        ? 'liked'
        : gift.dislikedBy?.includes(npcId)
          ? 'disliked'
          : 'neutral'
      return [giftId, reaction]
    }),
  )
}

function mergeNpcProgress(
  saved?: Partial<Record<string, NpcProgress>>,
): Record<string, NpcProgress> {
  const defaults = initialNpc()
  for (const def of NPC_DEFS) {
    const previous = saved?.[def.id]
    if (!previous) continue
    const merged = {
      ...defaults[def.id],
      ...previous,
      giftDiscoveries: reconcileGiftDiscoveries(
        def.id,
        previous.giftDiscoveries,
      ),
      seenDialogueIds: [...(previous.seenDialogueIds ?? [])],
      unlockedEventIds: [...(previous.unlockedEventIds ?? [])],
    }
    defaults[def.id] = {
      ...merged,
      interacted: inferInteracted(merged),
      unlockedEventIds: [
        ...new Set([
          ...merged.unlockedEventIds,
          ...eligibleEventIds(def.id, merged),
        ]),
      ],
    }
  }
  return defaults
}

function createInitial(): GameState {
  return {
    facilityMigrationVersion: 1,
    coins: STARTING_COINS,
    bond: 2,
    tasks: [],
    habits: [],
    projects: [],
    plans: [],
    habitRewardSnapshots: {},
    rooms: [
      { id: uid(), type: 'living', occupantId: null, level: 1 },
      { id: uid(), type: 'study', occupantId: null, level: 1 },
      { id: uid(), type: 'storage', occupantId: null, level: 1 },
    ],
    courtyardLevel: 1,
    npc: initialNpc(),
    inventory: [],
    decorations: [],
    placedDecorations: [],
    ownedLandscapes: ['open'],
    courtyardLandscape: 'open',
    milestones: [],
    lastDailyKey: '',
    deficitDays: 0,
    toast: null,
    dialogue: null,
    rewardFeedback: null,
    taskReaction: null,
    valleyRewardReady: false,
    lastBuiltRoomId: null,
    onboardingStep: 1,
    selectedNpcId: null,
    selectedRoomId: null,
    selectedEventId: null,
    tab: 'valley',
  }
}

function normalizeLandscapes(
  saved: Partial<GameState>,
  courtyardLevel: CourtyardLevel,
): Pick<GameState, 'ownedLandscapes' | 'courtyardLandscape'> {
  const validIds = new Set(COURTYARD_LANDSCAPE_DEFS.map((item) => item.id))
  const ownedLandscapes = Array.from(
    new Set([
      'open' as const,
      ...(saved.ownedLandscapes ?? []).filter((id) => validIds.has(id)),
    ]),
  )
  const selected = saved.courtyardLandscape ?? 'open'
  const courtyardLandscape =
    validIds.has(selected) &&
    ownedLandscapes.includes(selected) &&
    availableLandscape(selected, courtyardLevel)
      ? selected
      : 'open'
  return { ownedLandscapes, courtyardLandscape }
}

function migrateBuiltInFacilities(saved: Partial<GameState>): {
  rooms: RoomInstance[]
  coins: number
  refund: number
} {
  const source = saved.rooms ?? []
  const migrated = (saved.facilityMigrationVersion ?? 0) >= 1
  const rooms = source.filter((room, index) => {
    if (!isBuiltInRoom(room)) return true
    return source.findIndex((item) => item.type === room.type) === index
  })
  let refund = 0
  for (const type of ['living', 'study', 'storage'] as const) {
    const existing = rooms.find((room) => room.type === type)
    if (!existing) {
      rooms.push({ id: uid(), type, occupantId: null, level: 1 })
    } else if (!migrated && type !== 'living') {
      refund += ROOM_DEFS.find((definition) => definition.type === type)?.cost ?? 0
    }
  }
  return { rooms, coins: (saved.coins ?? STARTING_COINS) + refund, refund }
}

function maybeUnlockMeet(state: GameState): GameState {
  const npc = { ...state.npc }
  const hasKitchen = hasRoomType(state.rooms, 'kitchen')
  const hasStudy = hasRoomType(state.rooms, 'study')
  const partners = partnerIds(state).length
  const unlocks: Array<[string, boolean]> = [
    ['linchu', hasStudy || partners >= 1],
    ['baizhi', hasKitchen],
    ['suweiming', hasStudy],
    ['yueqingshan', state.deficitDays === 0 && partners >= 1],
    ['wenjiu', partners >= 2],
    ['hedeng', Object.values(npc).some((p) => friendshipStage(p.friendshipPoints) >= 2)],
  ]
  let changed = false
  for (const [id, ok] of unlocks) {
    if (ok && !npc[id].met) {
      npc[id] = { ...npc[id], met: true }
      changed = true
    }
  }
  for (const [id, progress] of Object.entries(npc)) {
    const existing = new Set(progress.unlockedEventIds)
    const additions = eligibleEventIds(id, progress).filter(
      (eventId) => !existing.has(eventId),
    )
    if (additions.length > 0) {
      npc[id] = {
        ...progress,
        unlockedEventIds: [...progress.unlockedEventIds, ...additions],
      }
      changed = true
    }
  }
  return changed ? { ...state, npc } : state
}

function persist(state: GameState): GameState {
  const unlocked = earnedMilestones(state)
  const next = maybeUnlockMeet({
    ...state,
    milestones: [...new Set([...state.milestones, ...unlocked])],
  })
  for (const [npcId, progress] of Object.entries(next.npc)) {
    const friendship = friendshipStage(progress.friendshipPoints)
    const romance = romanceStage(
      progress.romancePoints,
      progress.romanceUnlocked,
      progress.livingAtHome,
    )
    if (friendship > 0) {
      trackBetaEvent(
        'friendship_stage_unlocked',
        `${npcId}:${friendship}`,
        true,
      )
    }
    if (romance > 0) {
      trackBetaEvent('romance_stage_unlocked', `${npcId}:${romance}`, true)
    }
  }
  saveState(next)
  return next
}

interface Actions {
  hydrate: () => void
  setTab: (tab: TabId) => void
  selectNpc: (id: string | null) => void
  selectRoom: (id: string | null) => void
  selectEvent: (id: string | null) => void
  clearToast: () => void
  clearDialogue: () => void
  clearRewardFeedback: () => void
  clearTaskReaction: () => void
  clearValleyReward: () => void
  clearLastBuiltRoom: () => void
  setOnboardingStep: (step: OnboardingStep) => void
  importSave: (raw: string) => void
  addTask: (title: string, difficulty: Difficulty, category?: TaskCategory) => void
  editTask: (id: string, title: string, difficulty: Difficulty, category?: TaskCategory) => void
  completeTask: (id: string) => void
  undoCompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  setPlan: (target: PlanTarget, slot: PlanSlot, dayKey?: string) => void
  addHabit: (title: string, mode: HabitMode, targetCount: number, schedule: HabitSchedule, category?: TaskCategory) => void
  adjustHabit: (id: string, delta: number) => void
  archiveHabit: (id: string) => void
  addProject: (title: string, size: ProjectSize, dueDate?: string, category?: TaskCategory) => void
  updateProject: (id: string, title: string, dueDate?: string) => void
  addProjectBlock: (projectId: string, title: string, difficulty: Difficulty) => void
  deleteProjectBlock: (projectId: string, blockId: string) => void
  moveProjectBlock: (projectId: string, blockId: string, direction: -1 | 1) => void
  startProject: (id: string) => void
  completeProjectBlock: (projectId: string, blockId: string) => void
  undoProjectBlock: (projectId: string, blockId: string) => void
  archiveProject: (id: string) => void
  buyRoom: (type: RoomInstance['type']) => void
  upgradeCourtyard: () => void
  upgradeRoom: (id: string) => void
  buyGift: (giftId: string) => void
  buyDecoration: (decorationId: string) => void
  toggleDecoration: (decorationId: string) => void
  buyCourtyardLandscape: (landscapeId: CourtyardLandscapeId) => void
  selectCourtyardLandscape: (landscapeId: CourtyardLandscapeId) => void
  chat: (npcId: string) => void
  heartTalk: (npcId: string) => void
  unlockRomance: (npcId: string) => void
  giveGift: (npcId: string, giftId: string) => void
  teaWith: (npcId: string) => void
  invitePartner: (npcId: string) => void
  separatePartner: (npcId: string) => void
  runDailyIfNeeded: () => void
  resetGame: () => void
  debugSetValues: (values: {
    coins: number
    bond: number
    npcId: string
    friendship: number
    romance: number
  }) => void
}

export const useGameStore = create<GameState & Actions>((set, get) => ({
  ...createInitial(),

  hydrate: () => {
    const loaded = loadState()
    if (!loaded.state) {
      set(
        persist({
          ...createInitial(),
          lastDailyKey: localDayKey(),
          tab: 'tasks',
          toast:
            loaded.source === 'corrupt'
              ? '存档和备份均无法读取，已安全创建新进度'
              : '欢迎！先写下今天想完成的一件事',
        }),
      )
      return
    }
    const saved = loaded.state
    const facilities = migrateBuiltInFacilities(saved)
    const normalizedRooms = facilities.rooms.map((room) => ({
      ...room,
      level: room.level ?? 1,
      ...(room.type === 'bedroom' && room.level === 4
        ? { wingOccupantIds: room.wingOccupantIds ?? [null, null] }
        : {}),
    }))
    const minimumLevel = minimumCourtyardLevel(normalizedRooms)
    const courtyardLevel = Math.max(saved.courtyardLevel ?? 1, minimumLevel) as CourtyardLevel
    const landscapes = normalizeLandscapes(saved, courtyardLevel)
    const base = {
      ...createInitial(),
      ...saved,
      facilityMigrationVersion: 1,
      coins: facilities.coins,
      tasks: (saved.tasks ?? []).map((task) => ({
        ...task,
        category: task.category ?? 'errand',
      })),
      habits: (saved.habits ?? []).map((habit) => ({ ...habit, category: habit.category ?? 'errand' })),
      projects: (saved.projects ?? []).map((project) => ({ ...project, category: project.category ?? 'errand' })),
      plans: saved.plans ?? [],
      rooms: normalizedRooms,
      courtyardLevel,
      habitRewardSnapshots: saved.habitRewardSnapshots ?? {},
      npc: mergeNpcProgress(saved.npc),
      milestones: saved.milestones ?? [],
      decorations: saved.decorations ?? [],
      placedDecorations: (saved.placedDecorations ?? []).filter((id) =>
        (saved.decorations ?? []).includes(id),
      ),
      ...landscapes,
      onboardingStep: saved.onboardingStep ?? 0,
      toast:
        loaded.source === 'backup'
          ? '主存档受损，已从自动备份恢复'
          : loaded.migrated
            ? facilities.refund > 0
              ? `书房与库房已归入基础院落 · 返还 ${facilities.refund} 金币`
              : '旧存档已安全升级'
            : null,
      dialogue: null,
      rewardFeedback: null,
      taskReaction: null,
      valleyRewardReady: false,
      lastBuiltRoomId: null,
      selectedNpcId: null,
      selectedRoomId: null,
      selectedEventId: null,
    }
    if (loaded.source === 'backup' || loaded.migrated) saveState(base)
    set(base)
    get().runDailyIfNeeded()
  },

  setTab: (tab) => set({ tab }),
  selectNpc: (id) =>
    set({
      selectedNpcId: id,
      selectedRoomId: null,
      selectedEventId: null,
      dialogue: null,
    }),
  selectRoom: (id) =>
    set({
      selectedRoomId: id,
      selectedNpcId: null,
      selectedEventId: null,
      dialogue: null,
    }),
  selectEvent: (id) => set({ selectedEventId: id }),
  clearToast: () => set({ toast: null }),
  clearDialogue: () =>
    set((s) => {
      const active = s.dialogue
      if (!active) return s
      const progress = s.npc[active.npcId]
      if (!progress || progress.seenDialogueIds.includes(active.entryId)) {
        return { ...s, dialogue: null }
      }
      return persist({
        ...s,
        dialogue: null,
        npc: {
          ...s.npc,
          [active.npcId]: {
            ...progress,
            seenDialogueIds: [...progress.seenDialogueIds, active.entryId],
          },
        },
      })
    }),
  clearRewardFeedback: () => set({ rewardFeedback: null }),
  clearTaskReaction: () => set({ taskReaction: null }),
  clearValleyReward: () => set({ valleyRewardReady: false }),
  clearLastBuiltRoom: () => set({ lastBuiltRoomId: null }),
  setOnboardingStep: (step) =>
    set((s) => persist({ ...s, onboardingStep: step })),
  importSave: (raw) => {
    try {
      const imported = parseImportedState(raw)
      const facilities = migrateBuiltInFacilities(imported)
      const normalizedRooms = facilities.rooms.map((room) => ({
        ...room,
        level: room.level ?? 1,
        ...(room.type === 'bedroom' && room.level === 4
          ? { wingOccupantIds: room.wingOccupantIds ?? [null, null] }
          : {}),
      }))
      const minimumLevel = minimumCourtyardLevel(normalizedRooms)
      const courtyardLevel = Math.max(imported.courtyardLevel ?? 1, minimumLevel) as CourtyardLevel
      const landscapes = normalizeLandscapes(imported, courtyardLevel)
      const next = {
        ...createInitial(),
        ...imported,
        facilityMigrationVersion: 1,
        coins: facilities.coins,
        tasks: (imported.tasks ?? []).map((task) => ({ ...task, category: task.category ?? 'errand' })),
        habits: (imported.habits ?? []).map((habit) => ({ ...habit, category: habit.category ?? 'errand' })),
        projects: (imported.projects ?? []).map((project) => ({ ...project, category: project.category ?? 'errand' })),
        rooms: normalizedRooms,
        courtyardLevel,
        ...landscapes,
        habitRewardSnapshots: imported.habitRewardSnapshots ?? {},
        npc: mergeNpcProgress(imported.npc),
        onboardingStep: imported.onboardingStep ?? 0,
        toast: '存档导入成功',
        dialogue: null,
        rewardFeedback: null,
        taskReaction: null,
        valleyRewardReady: false,
        lastBuiltRoomId: null,
        selectedNpcId: null,
        selectedRoomId: null,
        selectedEventId: null,
        tab: 'valley' as const,
      }
      set(persist(next))
    } catch (error) {
      set((s) => ({
        ...s,
        toast: error instanceof Error ? error.message : '存档导入失败',
      }))
    }
  },

  addTask: (title, difficulty, category = 'errand') => {
    const t = title.trim()
    if (!t) return
    const task: Task = {
      id: uid(),
      title: t,
      difficulty,
      category,
      done: false,
      createdAt: new Date().toISOString(),
    }
    set((s) =>
      persist({
        ...s,
        tasks: [task, ...s.tasks],
        onboardingStep: s.onboardingStep === 1 ? 2 : s.onboardingStep,
        toast: s.onboardingStep === 1 ? '待办已添加。完成后可领取奖励。' : s.toast,
      }),
    )
  },

  editTask: (id, title, difficulty, category = 'errand') => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    set((s) =>
      persist({
        ...s,
        tasks: s.tasks.map((task) =>
          task.id === id && !task.done
            ? { ...task, title: cleanTitle, difficulty, category }
            : task,
        ),
        toast: '待办已更新',
      }),
    )
  },

  completeTask: (id) => {
    set((s) => {
      const task = s.tasks.find((t) => t.id === id)
      if (!task || task.done) return s
      const reward = TASK_REWARDS[task.difficulty]
      let coins = reward.coins
      const studyLevel = s.rooms.find((room) => room.type === 'study')?.level ?? 1
      if (
        (task.difficulty === 'medium' || task.difficulty === 'large') &&
        studyLevel > 1
      ) {
        coins = Math.round(coins * (studyLevel === 3 ? 1.1 : 1.05))
      }
      const bondGain = Math.min(reward.bond, Math.max(0, BOND_DAILY_CAP - s.bond))
      const tasks = s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              done: true,
              completedAt: new Date().toISOString(),
              awardedCoins: coins,
              awardedBond: bondGain,
            }
          : t,
      )
      const reaction = completionReactionFor(s, task)
      const firstCompletion = !s.tasks.some((item) => item.done)
      if (firstCompletion) {
        trackBetaEvent('first_task_completed', undefined, true)
      }
      return persist({
        ...s,
        tasks,
        coins: s.coins + coins,
        bond: s.bond + bondGain,
        rewardFeedback: {
          id: uid(),
          coins,
          bond: bondGain,
          kind: 'todo',
          title: task.title,
        },
        taskReaction: reaction
          ? {
              id: uid(),
              taskId: task.id,
              ...reaction,
            }
          : null,
        valleyRewardReady: true,
        onboardingStep: s.onboardingStep === 2 ? 3 : s.onboardingStep,
        toast: null,
      })
    })
  },

  undoCompleteTask: (id) => {
    set((s) => {
      const task = s.tasks.find((item) => item.id === id)
      if (!task || !taskCompletedOn(task)) {
        return { ...s, toast: '只能撤销今天完成的待办' }
      }
      const coins = task.awardedCoins ?? 0
      const bond = task.awardedBond ?? 0
      return persist({
        ...s,
        tasks: s.tasks.map((item) =>
          item.id === id
            ? {
                ...item,
                done: false,
                completedAt: undefined,
                awardedCoins: undefined,
                awardedBond: undefined,
              }
            : item,
        ),
        coins: Math.max(0, s.coins - coins),
        bond: Math.max(0, s.bond - bond),
        rewardFeedback: null,
        taskReaction:
          s.taskReaction?.taskId === task.id ? null : s.taskReaction,
        valleyRewardReady: false,
        toast: '已撤销完成，奖励也已退回',
      })
    })
  },

  deleteTask: (id) => {
    set((s) =>
      persist({
        ...s,
        tasks: s.tasks.filter((t) => t.id !== id),
        plans: removePlansForTarget(s.plans ?? [], { kind: 'task', id }),
      }),
    )
  },

  setPlan: (target, slot, dayKey) => {
    set((s) => {
      const key = dayKey ?? localDayKey()
      return persist({
        ...s,
        plans: upsertPlan(s.plans ?? [], key, target, slot),
        toast: slot === 'anytime' ? '已放到有空再做' : `已排到${slot === 'morning' ? '上午' : slot === 'afternoon' ? '下午' : '晚上'}`,
      })
    })
  },

  addHabit: (title, mode, targetCount, schedule, category = 'errand') => {
    const clean = title.trim()
    if (!clean) return
    const habit: Habit = {
      id: uid(),
      title: clean,
      mode,
      targetCount: mode === 'check' ? 1 : Math.max(1, Math.floor(targetCount)),
      schedule,
      active: true,
      createdAt: new Date().toISOString(),
      entries: [],
      weeklyRewardKeys: [],
      category,
    }
    set((s) => {
      const today = localDayKey()
      const snapshot = s.habitRewardSnapshots[today]
      return persist({
        ...s,
        habits: [...s.habits, habit],
        habitRewardSnapshots:
          snapshot && snapshot.length < HABIT_REWARD_SLOTS
            ? {
                ...s.habitRewardSnapshots,
                [today]: [...snapshot, habit.id],
              }
            : s.habitRewardSnapshots,
      })
    })
  },

  adjustHabit: (id, delta) => {
    set((s) => {
      const habit = s.habits.find((item) => item.id === id)
      if (!habit || !habit.active) return s
      const now = new Date()
      const dayKey = localDayKey(now)
      const existing = habitEntryFor(habit, dayKey)
      const beforeCount = existing?.count ?? 0
      const count = Math.max(0, Math.min(habit.targetCount, beforeCount + delta))
      if (count === beforeCount) return s
      const beforeDone = beforeCount >= habit.targetCount
      const afterDone = count >= habit.targetCount
      const snapshot =
        s.habitRewardSnapshots[dayKey] ??
        s.habits.filter((item) => item.active).slice(0, HABIT_REWARD_SLOTS).map((item) => item.id)
      let coinsGain = 0
      let bondGain = 0
      const canReward = snapshot.includes(id)
      const firstDailyReward = afterDone && !beforeDone && existing?.awardedCoins === undefined
      if (canReward && firstDailyReward) {
        coinsGain += HABIT_REWARD.coins
        bondGain += Math.min(HABIT_REWARD.bond, Math.max(0, BOND_DAILY_CAP - (s.bond + bondGain)))
      }
      const entry = {
        dayKey,
        count,
        completedAt: afterDone ? existing?.completedAt ?? now.toISOString() : undefined,
        awardedCoins:
          existing?.awardedCoins ?? (canReward && firstDailyReward ? HABIT_REWARD.coins : undefined),
        awardedBond:
          existing?.awardedBond ?? (canReward && firstDailyReward ? bondGain : undefined),
      }
      let updatedHabit: Habit = {
        ...habit,
        entries: [...habit.entries.filter((item) => item.dayKey !== dayKey), entry],
      }
      const weekKey = mondayKey(now)
      const weekly = habitWeeklyProgress(updatedHabit, now)
      const weeklyReward =
        canReward &&
        weekly.completed >= weekly.target &&
        !updatedHabit.weeklyRewardKeys.includes(weekKey)
      if (weeklyReward) {
        coinsGain += HABIT_WEEKLY_REWARD.coins
        const weeklyBond = Math.min(
          HABIT_WEEKLY_REWARD.bond,
          Math.max(0, BOND_DAILY_CAP - (s.bond + bondGain)),
        )
        bondGain += weeklyBond
        updatedHabit = {
          ...updatedHabit,
          weeklyRewardKeys: [...updatedHabit.weeklyRewardKeys, weekKey],
        }
      }
      return persist({
        ...s,
        habits: s.habits.map((item) => (item.id === id ? updatedHabit : item)),
        habitRewardSnapshots: {
          ...s.habitRewardSnapshots,
          [dayKey]: snapshot,
        },
        coins: s.coins + coinsGain,
        bond: s.bond + bondGain,
        rewardFeedback:
          afterDone && !beforeDone
            ? {
                id: uid(),
                coins: coinsGain,
                bond: bondGain,
                kind: 'habit',
                title: habit.title,
              }
            : s.rewardFeedback,
        valleyRewardReady: afterDone && !beforeDone ? true : s.valleyRewardReady,
      })
    })
  },

  archiveHabit: (id) =>
    set((s) =>
      persist({
        ...s,
        habits: s.habits.map((habit) =>
          habit.id === id ? { ...habit, active: false } : habit,
        ),
        plans: removePlansForTarget(s.plans ?? [], { kind: 'habit', id }),
      }),
    ),

  addProject: (title, size, dueDate, category = 'errand') => {
    const clean = title.trim()
    if (!clean) return
    set((s) =>
      persist({
        ...s,
        projects: [
          ...s.projects,
          {
            id: uid(),
            title: clean,
            size,
            status: 'draft' as const,
            createdAt: new Date().toISOString(),
            dueDate: dueDate || undefined,
            blocks: [],
            awardedMilestones: [],
            category,
          },
        ],
      }),
    )
  },

  updateProject: (id, title, dueDate) => {
    const clean = title.trim()
    if (!clean) return
    set((s) =>
      persist({
        ...s,
        projects: s.projects.map((project) =>
          project.id === id
            ? { ...project, title: clean, dueDate: dueDate || undefined }
            : project,
        ),
      }),
    )
  },

  addProjectBlock: (projectId, title, difficulty) => {
    const clean = title.trim()
    if (!clean) return
    set((s) =>
      persist({
        ...s,
        projects: s.projects.map((project) =>
          project.id === projectId && project.status !== 'completed' && project.status !== 'archived'
            ? {
                ...project,
                blocks: [
                  ...project.blocks,
                  {
                    id: uid(),
                    title: clean,
                    difficulty,
                    done: false,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : project,
        ),
      }),
    )
  },

  deleteProjectBlock: (projectId, blockId) =>
    set((s) =>
      persist({
        ...s,
        projects: s.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                blocks: project.blocks.filter((block) => block.id !== blockId || block.done),
              }
            : project,
        ),
        plans: removePlansForBlock(s.plans ?? [], projectId, blockId),
      }),
    ),

  moveProjectBlock: (projectId, blockId, direction) =>
    set((s) =>
      persist({
        ...s,
        projects: s.projects.map((project) => {
          if (project.id !== projectId) return project
          const index = project.blocks.findIndex((block) => block.id === blockId)
          const target = index + direction
          if (index < 0 || target < 0 || target >= project.blocks.length) return project
          const blocks = [...project.blocks]
          ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
          return { ...project, blocks }
        }),
      }),
    ),

  startProject: (id) =>
    set((s) => {
      const project = s.projects.find((item) => item.id === id)
      if (!project || project.status !== 'draft') return s
      const minimum = PROJECT_REWARDS[project.size].minBlocks
      if (project.blocks.length < minimum) {
        return { ...s, toast: `至少需要 ${minimum} 个分块` }
      }
      return persist({
        ...s,
        projects: s.projects.map((item) =>
          item.id === id ? { ...item, status: 'active' } : item,
        ),
      })
    }),

  completeProjectBlock: (projectId, blockId) =>
    set((s) => {
      const project = s.projects.find((item) => item.id === projectId)
      const block = project?.blocks.find((item) => item.id === blockId)
      if (!project || !block || project.status !== 'active' || block.done) return s
      const before = projectProgress(project).percent
      const baseReward = nextBlockReward(project, blockId)
      const config = PROJECT_REWARDS[project.size]
      const paidBlockCoins = project.blocks.reduce((sum, item) => sum + (item.awardedCoins ?? 0), 0)
      const studyLevel = s.rooms.find((room) => room.type === 'study')?.level ?? 1
      const studyMultiplier = studyLevel === 3 ? 1.1 : studyLevel === 2 ? 1.05 : 1
      const studyCoins = studyLevel > 1
        ? Math.min(
            Math.max(0, config.blockCoins - paidBlockCoins),
            Math.round(baseReward.coins * studyMultiplier),
          )
        : baseReward.coins
      const blocks = project.blocks.map((item) =>
        item.id === blockId
          ? {
              ...item,
              done: true,
              completedAt: new Date().toISOString(),
              awardedCoins: item.awardedCoins ?? studyCoins,
              awardedBond: item.awardedBond ?? baseReward.bond,
            }
          : item,
      )
      const afterProject = { ...project, blocks }
      const after = projectProgress(afterProject).percent
      const milestones = crossedMilestones(before, after).filter(
        (milestone) => !project.awardedMilestones.includes(milestone),
      )
      const milestoneReward = milestones.reduce(
        (sum, milestone) => ({
          coins: sum.coins + config.milestones[milestone].coins,
          bond: sum.bond + config.milestones[milestone].bond,
        }),
        { coins: 0, bond: 0 },
      )
      const coinsGain = (block.awardedCoins === undefined ? studyCoins : 0) + milestoneReward.coins
      const requestedBond = (block.awardedBond === undefined ? baseReward.bond : 0) + milestoneReward.bond
      const bondGain = Math.min(requestedBond, Math.max(0, BOND_DAILY_CAP - s.bond))
      const completed = after >= 100
      const updatedProject = {
        ...afterProject,
        status: completed ? ('completed' as const) : project.status,
        awardedMilestones: [...project.awardedMilestones, ...milestones],
      }
      const reaction = completionReactionFor(s, {
        id: block.id,
        title: block.title,
        difficulty: block.difficulty,
        done: false,
        createdAt: block.createdAt,
      })
      return persist({
        ...s,
        projects: s.projects.map((item) => (item.id === projectId ? updatedProject : item)),
        coins: s.coins + coinsGain,
        bond: s.bond + bondGain,
        rewardFeedback: {
          id: uid(),
          coins: coinsGain,
          bond: bondGain,
          kind: completed
            ? 'project_complete'
            : milestones.length > 0
              ? 'project_milestone'
              : 'project_block',
          title: completed ? project.title : block.title,
          progressBefore: before,
          progressAfter: after,
        },
        taskReaction: reaction
          ? { id: uid(), taskId: block.id, ...reaction }
          : null,
        valleyRewardReady: true,
      })
    }),

  undoProjectBlock: (projectId, blockId) =>
    set((s) => {
      const project = s.projects.find((item) => item.id === projectId)
      const block = project?.blocks.find((item) => item.id === blockId)
      if (!project || !block?.done || !block.completedAt || localDayKey(new Date(block.completedAt)) !== localDayKey()) {
        return { ...s, toast: '只能撤销今天完成的分块' }
      }
      return persist({
        ...s,
        projects: s.projects.map((item) =>
          item.id === projectId
            ? {
                ...item,
                status: 'active',
                blocks: item.blocks.map((part) =>
                  part.id === blockId
                    ? { ...part, done: false, completedAt: undefined }
                    : part,
                ),
              }
            : item,
        ),
        toast: '已撤销进度，奖励不会重复发放',
      })
    }),

  archiveProject: (id) =>
    set((s) =>
      persist({
        ...s,
        projects: s.projects.map((project) =>
          project.id === id ? { ...project, status: 'archived' } : project,
        ),
        plans: removePlansForProject(s.plans ?? [], id),
      }),
    ),

  buyRoom: (type) => {
    set((s) => {
      const def = ROOM_DEFS.find((r) => r.type === type)
      if (!def || def.cost <= 0) return s
      if (isBuiltInRoom(type)) return s
      if (roomTypeLimitReached(s.rooms, type)) {
        return { ...s, toast: `已经有${def.name}` }
      }
      if (!canAddRoom(s.rooms, s.courtyardLevel, type)) {
        return { ...s, toast: '院子满了' }
      }
      if (s.coins < def.cost) {
        return { ...s, toast: '金币不够哦' }
      }
      const room: RoomInstance = { id: uid(), type, occupantId: null, level: 1 }
      trackBetaEvent('room_purchased', type)
      return persist({
        ...s,
        coins: s.coins - def.cost,
        rooms: [...s.rooms, room],
        lastBuiltRoomId: room.id,
        toast: `买好了：${def.name}`,
      })
    })
  },

  upgradeCourtyard: () => {
    set((s) => {
      const current = COURTYARD_LEVELS[s.courtyardLevel]
      if (s.courtyardLevel >= 4 || current.upgradeCost === null) {
        return { ...s, toast: '已经是二进院' }
      }
      const used = courtyardCapacityUsed(s.rooms)
      if (used < current.capacity) {
        return { ...s, toast: `${used}/${current.capacity}` }
      }
      if (s.coins < current.upgradeCost) {
        return { ...s, toast: `还差 ${current.upgradeCost - s.coins} 金币` }
      }
      const nextLevel = (s.courtyardLevel + 1) as CourtyardLevel
      return persist({
        ...s,
        coins: s.coins - current.upgradeCost,
        courtyardLevel: nextLevel,
        valleyRewardReady: true,
        toast: `扩建完成 · ${COURTYARD_LEVELS[nextLevel].name}`,
      })
    })
  },

  upgradeRoom: (id) => {
    set((s) => {
      const room = s.rooms.find((item) => item.id === id)
      if (!room) return s
      const level = room.level ?? 1
      const maxLevel = maxRoomLevel(room.type)
      if (level >= maxLevel) return { ...s, toast: '已经升到最高级' }
      if (
        room.type === 'bedroom' &&
        level === 3 &&
        !canUpgradeBedroomToCourtyard(s.rooms, s.courtyardLevel, room.id)
      ) {
        if (s.courtyardLevel < 4) return { ...s, toast: '需要二进院宅地' }
        if (s.rooms.some((item) => item.type === 'bedroom' && item.level === 4)) {
          return { ...s, toast: '院居宅地已使用' }
        }
        return { ...s, toast: '请空出两个宅地' }
      }
      const cost = ROOM_UPGRADE_COSTS[room.type][level as 1 | 2 | 3]
      if (cost === undefined) return { ...s, toast: '已经升到最高级' }
      if (s.coins < cost) return { ...s, toast: `还差 ${cost - s.coins} 金币` }
      const nextLevel = (level + 1) as 2 | 3 | 4
      return persist({
        ...s,
        coins: s.coins - cost,
        rooms: s.rooms.map((item) =>
          item.id === id
            ? {
                ...item,
                level: nextLevel,
                ...(nextLevel === 4 ? { wingOccupantIds: [null, null] as [null, null] } : {}),
              }
            : item,
        ),
        lastBuiltRoomId: id,
        toast: `房间升级完成 · ${nextLevel} 级`,
      })
    })
  },

  buyGift: (giftId) => {
    set((s) => {
      const def = GIFT_DEFS.find((g) => g.id === giftId)
      if (!def) return s
      if (s.coins < def.cost) {
        return { ...s, toast: '金币不够哦' }
      }
      if (inventoryCount(s) >= giftCapacity(s)) {
        return {
          ...s,
          toast: '礼物袋放满了。扩建储藏室可以多放 8 件礼物',
        }
      }
      const inv = [...s.inventory]
      const existing = inv.find((i) => i.id === giftId)
      if (existing) existing.qty += 1
      else inv.push({ id: giftId, qty: 1 })
      return persist({
        ...s,
        coins: s.coins - def.cost,
        inventory: inv,
        toast: `买到了：${def.name}`,
      })
    })
  },

  buyDecoration: (decorationId) => {
    set((s) => {
      const def = DECORATION_DEFS.find((item) => item.id === decorationId)
      if (!def || s.decorations.includes(decorationId)) return s
      if (s.coins < def.cost) {
        return { ...s, toast: '金币不够哦' }
      }
      return persist({
        ...s,
        coins: s.coins - def.cost,
        decorations: [...s.decorations, decorationId],
        placedDecorations:
          s.placedDecorations.length < 6
            ? [...s.placedDecorations, decorationId]
            : s.placedDecorations,
        toast:
          s.placedDecorations.length < 6
            ? `${def.name}已经摆进山谷`
            : `买到了${def.name}，山谷最多同时摆 6 件`,
      })
    })
  },

  toggleDecoration: (decorationId) => {
    set((s) => {
      if (!s.decorations.includes(decorationId)) return s
      const placed = s.placedDecorations.includes(decorationId)
      if (!placed && s.placedDecorations.length >= 6) {
        return { ...s, toast: '山谷最多同时摆 6 件装饰，先收起一件吧' }
      }
      return persist({
        ...s,
        placedDecorations: placed
          ? s.placedDecorations.filter((id) => id !== decorationId)
          : [...s.placedDecorations, decorationId],
        toast: placed ? '装饰已经收好' : '装饰已经摆好',
      })
    })
  },

  buyCourtyardLandscape: (landscapeId) => {
    set((s) => {
      const def = courtyardLandscapeDef(landscapeId)
      if (def.id === 'open' || s.ownedLandscapes.includes(def.id)) return s
      if (!availableLandscape(def.id, s.courtyardLevel)) {
        return { ...s, toast: `需要${def.minCourtyardLevel}级院落` }
      }
      if (valleyStage(s) < def.stage) {
        return { ...s, toast: '山谷成长还不够' }
      }
      if (s.coins < def.cost) return { ...s, toast: '金币不够哦' }
      return persist({
        ...s,
        coins: s.coins - def.cost,
        ownedLandscapes: [...s.ownedLandscapes, def.id],
        courtyardLandscape: def.id,
        toast: `${def.name}已经布置好`,
      })
    })
  },

  selectCourtyardLandscape: (landscapeId) => {
    set((s) => {
      if (!s.ownedLandscapes.includes(landscapeId)) return s
      if (!availableLandscape(landscapeId, s.courtyardLevel)) {
        return { ...s, toast: '当前院落放不下这套主景' }
      }
      if (s.courtyardLandscape === landscapeId) return s
      const def = courtyardLandscapeDef(landscapeId)
      return persist({
        ...s,
        courtyardLandscape: landscapeId,
        toast: `已换成${def.name}`,
      })
    })
  },

  chat: (npcId) => {
    set((s) =>
      interact(s, npcId, 1, { friendship: 8, romance: 2 }, 'chat', '友情 +8'),
    )
  },

  heartTalk: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p || friendshipStage(p.friendshipPoints) < 2) {
        return { ...s, toast: '再熟一点再聊吧' }
      }
      return interact(
        s,
        npcId,
        2,
        { friendship: 14, romance: 4 },
        'heart',
        '友情 +14',
      )
    })
  },

  unlockRomance: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p) return s
      if (friendshipStage(p.friendshipPoints) < 2) {
        return { ...s, toast: '先成为好友吧' }
      }
      if (p.romanceUnlocked) {
        return { ...s, toast: '已经表白过啦' }
      }
      if (s.bond < 2) return { ...s, toast: '精力不够' }
      if (p.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
        return { ...s, toast: '今天聊够啦，明天再来' }
      }
      const npc = {
        ...s.npc,
        [npcId]: {
          ...p,
          interacted: true,
          romanceUnlocked: true,
          romancePoints: Math.max(p.romancePoints, 30),
          interactionsToday: p.interactionsToday + 1,
        },
      }
      return persist({
        ...s,
        bond: s.bond - 2,
        npc,
        dialogue: dialogueFor(s, npcId, 'romance', p.interactionsToday),
        toast: '喜欢线已开启',
      })
    })
  },

  giveGift: (npcId, giftId) => {
    set((s) => {
      const p = s.npc[npcId]
      const def = GIFT_DEFS.find((g) => g.id === giftId)
      const item = s.inventory.find((i) => i.id === giftId)
      if (!p || !def || !item || item.qty <= 0) return s
      if (p.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
        return { ...s, toast: '今天聊够啦，明天再来' }
      }
      const reaction: GiftReaction = def.likedBy.includes(npcId)
        ? 'liked'
        : def.dislikedBy?.includes(npcId)
          ? 'disliked'
          : 'neutral'
      const friendship =
        reaction === 'liked' ? 10 : reaction === 'neutral' ? 6 : 1
      const romance = p.romanceUnlocked
        ? reaction === 'liked'
          ? 18
          : reaction === 'neutral'
            ? 2
            : 0
        : 0
      const inv = s.inventory
        .map((i) => (i.id === giftId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
      const npc = {
        ...s.npc,
        [npcId]: {
          ...p,
          interacted: true,
          friendshipPoints: p.friendshipPoints + friendship,
          romancePoints: p.romancePoints + romance,
          interactionsToday: p.interactionsToday + 1,
          giftDiscoveries: {
            ...p.giftDiscoveries,
            [giftId]: reaction,
          },
        },
      }
      return persist({
        ...s,
        inventory: inv,
        npc,
        dialogue: dialogueFor(
          s,
          npcId,
          reaction === 'liked'
            ? 'giftLiked'
            : reaction === 'disliked'
              ? 'giftDisliked'
              : 'giftNeutral',
          p.interactionsToday,
        ),
        toast:
          reaction === 'liked'
            ? `很喜欢：${def.name}`
            : reaction === 'disliked'
              ? `似乎不太喜欢：${def.name}`
              : `收下了：${def.name}`,
      })
    })
  },

  teaWith: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p?.livingAtHome) return s
      return interact(
        s,
        npcId,
        1,
        { friendship: 4, romance: 12 },
        'tea',
        '喜欢 +12',
      )
    })
  },

  invitePartner: (npcId) => {
    set((s) => {
      if (!canInvite(s, npcId)) {
        return {
          ...s,
          toast: '要超喜欢 + 空房 + 20 金币哦',
        }
      }
      const bed = s.rooms.find((room) => roomResidentIds(room).some((id) => !id))
      if (!bed) return s
      const rooms = s.rooms.map((room) =>
        room.id === bed.id ? assignResident(room, npcId) ?? room : room,
      )
      const npc = {
        ...s.npc,
        [npcId]: { ...s.npc[npcId], livingAtHome: true },
      }
      const name = NPC_DEFS.find((n) => n.id === npcId)?.name ?? ''
      const line = NPC_DEFS.find((n) => n.id === npcId)?.inviteLine ?? ''
      return persist({
        ...s,
        coins: s.coins - HOME_FEE,
        rooms,
        npc,
        dialogue: dialogueFor(
          { ...s, npc, rooms },
          npcId,
          'invite',
          s.npc[npcId]?.interactionsToday ?? 0,
        ),
        toast: `${name}搬进来了！${line}`,
      })
    })
  },

  separatePartner: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p?.livingAtHome) return s
      const rooms = s.rooms.map((r) =>
        roomResidentIds(r).includes(npcId) ? removeResident(r, npcId) : r,
      )
      const npc = {
        ...s.npc,
        [npcId]: { ...p, livingAtHome: false },
      }
      const name = NPC_DEFS.find((n) => n.id === npcId)?.name ?? ''
      const line = NPC_DEFS.find((n) => n.id === npcId)?.leaveLine ?? ''
      return persist({
        ...s,
        rooms,
        npc,
        toast: `${name}搬出去了。${line}`,
        selectedNpcId: null,
      })
    })
  },

  runDailyIfNeeded: () => {
    set((s) => {
      const today = localDayKey()
      if (s.lastDailyKey === today) return s

      let coins = s.coins
      let deficitDays = s.deficitDays
      let toast = `新的一天！+${DAILY_LOGIN_BONUS} 金币，精力 +1`

      // Settle missed days (at least 1)
      const due = totalDailyMaintenance(s)
      if (due > 0) {
        if (coins >= due) {
          coins -= due
          deficitDays = 0
          toast = `维护 -${due}，登录 +${DAILY_LOGIN_BONUS}`
        } else {
          coins = 0
          deficitDays += 1
          toast = '钱不够付维护啦，去做点待办吧'
        }
      }

      coins += DAILY_LOGIN_BONUS
      const npc = Object.fromEntries(
        Object.entries(s.npc).map(([id, p]) => [
          id,
          { ...p, interactionsToday: 0 },
        ]),
      )
      const habitRewardSnapshots = {
        ...s.habitRewardSnapshots,
        [today]: s.habits
          .filter((habit) => habit.active)
          .slice(0, HABIT_REWARD_SLOTS)
          .map((habit) => habit.id),
      }

      return persist({
        ...s,
        coins,
        bond: Math.min(BOND_DAILY_CAP, s.bond + 1),
        deficitDays,
        lastDailyKey: today,
        habitRewardSnapshots,
        npc,
        toast,
      })
    })
  },

  resetGame: () => {
    const fresh = {
      ...createInitial(),
      lastDailyKey: localDayKey(),
      tab: 'tasks' as const,
      toast: '已重置，重新开始！',
    }
    set(persist(fresh))
  },

  debugSetValues: ({ coins, bond, npcId, friendship, romance }) => {
    if (!import.meta.env.DEV) return
    set((s) => {
      const progress = s.npc[npcId]
      if (!progress) return s
      return persist({
        ...s,
        coins: Math.max(0, Math.floor(coins)),
        bond: Math.max(0, Math.min(BOND_DAILY_CAP, Math.floor(bond))),
        npc: {
          ...s.npc,
          [npcId]: {
            ...progress,
            met: true,
            interacted: true,
            friendshipPoints: Math.max(0, Math.floor(friendship)),
            romancePoints: Math.max(0, Math.floor(romance)),
            romanceUnlocked: progress.romanceUnlocked || romance > 0,
          },
        },
        toast: '测试数值已更新',
      })
    })
  },
}))

function interact(
  s: GameState,
  npcId: string,
  cost: number,
  gain: { friendship: number; romance: number },
  kind: DialogueKind,
  okToast: string,
): GameState {
  const p = s.npc[npcId]
  if (!p?.met) return { ...s, toast: '还没遇见 ta' }
  if (s.bond < cost) return { ...s, toast: '精力不够，去做待办吧' }
  if (p.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
    return { ...s, toast: '今天聊够啦，明天再来' }
  }
  const romanceGain = p.romanceUnlocked ? gain.romance : 0
  const npc = {
    ...s.npc,
    [npcId]: {
      ...p,
      interacted: true,
      friendshipPoints: p.friendshipPoints + gain.friendship,
      romancePoints: p.romancePoints + romanceGain,
      interactionsToday: p.interactionsToday + 1,
    },
  }
  if (s.tasks.some((task) => task.done)) {
    trackBetaEvent('core_loop_completed', undefined, true)
  }
  return persist({
    ...s,
    bond: s.bond - cost,
    npc,
    onboardingStep: s.onboardingStep === 3 ? 4 : s.onboardingStep,
    dialogue: dialogueFor({ ...s, npc }, npcId, kind, p.interactionsToday),
    toast: okToast,
  })
}

export function stageLabels(p: NpcProgress) {
  return {
    f: friendshipStage(p.friendshipPoints),
    r: romanceStage(p.romancePoints, p.romanceUnlocked, p.livingAtHome),
  }
}

export { emptyBeds, canInvite, totalDailyMaintenance, partnerIds }
