import { create } from 'zustand'
import {
  BOND_DAILY_CAP,
  DAILY_LOGIN_BONUS,
  DECORATION_DEFS,
  GIFT_DEFS,
  HOME_FEE,
  INTERACTIONS_PER_NPC_PER_DAY,
  ROOM_DEFS,
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
import { earnedMilestones, giftCapacity, inventoryCount } from './growth'
import { trackBetaEvent } from './beta'
import type {
  DialogueKind,
  Difficulty,
  GameState,
  GiftReaction,
  NpcProgress,
  OnboardingStep,
  RoomInstance,
  TabId,
  Task,
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
      interactionsToday: 0,
      giftDiscoveries: {},
      seenDialogueIds: [],
      unlockedEventIds: [],
    }
  }
  return map
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
      giftDiscoveries: {
        ...defaults[def.id].giftDiscoveries,
        ...(previous.giftDiscoveries ?? {}),
      },
      seenDialogueIds: [...(previous.seenDialogueIds ?? [])],
      unlockedEventIds: [...(previous.unlockedEventIds ?? [])],
    }
    defaults[def.id] = {
      ...merged,
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
    coins: STARTING_COINS,
    bond: 2,
    tasks: [],
    rooms: [{ id: uid(), type: 'living', occupantId: null }],
    npc: initialNpc(),
    inventory: [],
    decorations: [],
    placedDecorations: [],
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
  addTask: (title: string, difficulty: Difficulty) => void
  editTask: (id: string, title: string, difficulty: Difficulty) => void
  completeTask: (id: string) => void
  undoCompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  buyRoom: (type: RoomInstance['type']) => void
  buyGift: (giftId: string) => void
  buyDecoration: (decorationId: string) => void
  toggleDecoration: (decorationId: string) => void
  chat: (npcId: string) => void
  heartTalk: (npcId: string) => void
  unlockRomance: (npcId: string) => void
  giveGift: (npcId: string, giftId: string) => void
  teaWith: (npcId: string) => void
  invitePartner: (npcId: string) => void
  separatePartner: (npcId: string) => void
  runDailyIfNeeded: () => void
  resetGame: () => void
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
    const base = {
      ...createInitial(),
      ...saved,
      npc: mergeNpcProgress(saved.npc),
      milestones: saved.milestones ?? [],
      decorations: saved.decorations ?? [],
      placedDecorations: (saved.placedDecorations ?? []).filter((id) =>
        (saved.decorations ?? []).includes(id),
      ),
      onboardingStep: saved.onboardingStep ?? 0,
      toast:
        loaded.source === 'backup'
          ? '主存档受损，已从自动备份恢复'
          : loaded.migrated
            ? '旧存档已安全升级'
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
      const next = {
        ...createInitial(),
        ...imported,
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

  addTask: (title, difficulty) => {
    const t = title.trim()
    if (!t) return
    const task: Task = {
      id: uid(),
      title: t,
      difficulty,
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

  editTask: (id, title, difficulty) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    set((s) =>
      persist({
        ...s,
        tasks: s.tasks.map((task) =>
          task.id === id && !task.done
            ? { ...task, title: cleanTitle, difficulty }
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
      if (
        (task.difficulty === 'medium' || task.difficulty === 'large') &&
        hasRoomType(s.rooms, 'study')
      ) {
        coins = Math.round(coins * 1.1)
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
        rewardFeedback: { id: uid(), coins, bond: bondGain },
        taskReaction: {
          id: uid(),
          taskId: task.id,
          ...reaction,
        },
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
    set((s) => persist({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  buyRoom: (type) => {
    set((s) => {
      const def = ROOM_DEFS.find((r) => r.type === type)
      if (!def || def.cost <= 0) return s
      if (type === 'living') return s
      if (s.coins < def.cost) {
        return { ...s, toast: '金币不够哦' }
      }
      const room: RoomInstance = { id: uid(), type, occupantId: null }
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
      const bed = s.rooms.find((r) => {
        const def = ROOM_DEFS.find((d) => d.type === r.type)
        return (def?.capacity ?? 0) > 0 && !r.occupantId
      })
      if (!bed) return s
      const rooms = s.rooms.map((r) =>
        r.id === bed.id ? { ...r, occupantId: npcId } : r,
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
        r.occupantId === npcId ? { ...r, occupantId: null } : r,
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

      return persist({
        ...s,
        coins,
        bond: Math.min(BOND_DAILY_CAP, s.bond + 1),
        deficitDays,
        lastDailyKey: today,
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
