import { create } from 'zustand'
import {
  BOND_DAILY_CAP,
  DAILY_LOGIN_BONUS,
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
  totalDailyMaintenance,
} from './economy'
import { NPC_DEFS } from './npcs'
import { loadState, saveState } from './storage'
import type {
  Difficulty,
  GameState,
  NpcProgress,
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
    }
  }
  return map
}

function createInitial(): GameState {
  return {
    coins: STARTING_COINS,
    bond: 2,
    tasks: [],
    rooms: [{ id: uid(), type: 'living', occupantId: null }],
    npc: initialNpc(),
    inventory: [],
    lastDailyKey: '',
    deficitDays: 0,
    toast: null,
    selectedNpcId: null,
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
  return changed ? { ...state, npc } : state
}

function persist(state: GameState): GameState {
  const next = maybeUnlockMeet(state)
  saveState(next)
  return next
}

interface Actions {
  hydrate: () => void
  setTab: (tab: TabId) => void
  selectNpc: (id: string | null) => void
  clearToast: () => void
  addTask: (title: string, difficulty: Difficulty) => void
  completeTask: (id: string) => void
  deleteTask: (id: string) => void
  buyRoom: (type: RoomInstance['type']) => void
  buyGift: (giftId: string) => void
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
    const saved = loadState()
    if (!saved) {
      set(persist({ ...createInitial(), lastDailyKey: localDayKey(), toast: '山谷醒了。先写下一件小事吧。' }))
      return
    }
    const base = { ...createInitial(), ...saved, toast: null }
    set(base)
    get().runDailyIfNeeded()
  },

  setTab: (tab) => set({ tab }),
  selectNpc: (id) => set({ selectedNpcId: id }),
  clearToast: () => set({ toast: null }),

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
    set((s) => persist({ ...s, tasks: [task, ...s.tasks] }))
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
          ? { ...t, done: true, completedAt: new Date().toISOString() }
          : t,
      )
      return persist({
        ...s,
        tasks,
        coins: s.coins + coins,
        bond: s.bond + bondGain,
        toast: `小事落地：+${coins} 金币${bondGain ? ` · +${bondGain} 心意` : ''}`,
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
        return { ...s, toast: '金币还不够。再做几件小事吧。' }
      }
      const room: RoomInstance = { id: uid(), type, occupantId: null }
      return persist({
        ...s,
        coins: s.coins - def.cost,
        rooms: [...s.rooms, room],
        toast: `${def.name}贴上小屋了。`,
      })
    })
  },

  buyGift: (giftId) => {
    set((s) => {
      const def = GIFT_DEFS.find((g) => g.id === giftId)
      if (!def) return s
      if (s.coins < def.cost) {
        return { ...s, toast: '这点金币还买不下这份小心意。' }
      }
      const inv = [...s.inventory]
      const existing = inv.find((i) => i.id === giftId)
      if (existing) existing.qty += 1
      else inv.push({ id: giftId, qty: 1 })
      return persist({
        ...s,
        coins: s.coins - def.cost,
        inventory: inv,
        toast: `收进口袋：${def.name}`,
      })
    })
  },

  chat: (npcId) => {
    set((s) => interact(s, npcId, 1, { friendship: 8, romance: 2 }, '闲聊了一阵。'))
  },

  heartTalk: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p || friendshipStage(p.friendshipPoints) < 2) {
        return { ...s, toast: '再熟一点，才好说心事。' }
      }
      return interact(s, npcId, 2, { friendship: 14, romance: 4 }, '心事落了一角。')
    })
  },

  unlockRomance: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p) return s
      if (friendshipStage(p.friendshipPoints) < 2) {
        return { ...s, toast: '至少先成为好友吧。' }
      }
      if (p.romanceUnlocked) {
        return { ...s, toast: '心意早已说开了。' }
      }
      if (s.bond < 2) return { ...s, toast: '心意不够了。' }
      if (p.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
        return { ...s, toast: '今天先到这儿，明日再来。' }
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
        toast: '有些话，轻轻说开了。',
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
        return { ...s, toast: '今天先到这儿，明日再来。' }
      }
      const liked = def.likedBy.includes(npcId)
      const friendship = liked ? 6 : 10
      const romance = liked && p.romanceUnlocked ? 18 : liked ? 4 : 2
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
        },
      }
      return persist({
        ...s,
        inventory: inv,
        npc,
        toast: liked ? `${def.name}正合心意。` : `${def.name}也收下了，笑了一下。`,
      })
    })
  },

  teaWith: (npcId) => {
    set((s) => {
      const p = s.npc[npcId]
      if (!p?.livingAtHome) return s
      return interact(s, npcId, 1, { friendship: 4, romance: 12 }, '茶温还在。')
    })
  },

  invitePartner: (npcId) => {
    set((s) => {
      if (!canInvite(s, npcId)) {
        return {
          ...s,
          toast: '还差点火候：眷恋、空房，或安家的二十文。',
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
        toast: `${name}提着小包进了门。「${line}」`,
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
        toast: `${name}先去山谷住一阵。「${line}」`,
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
      let toast = `新的一天。首登 +${DAILY_LOGIN_BONUS} 金币，心意回了一点。`

      // Settle missed days (at least 1)
      const due = totalDailyMaintenance(s)
      if (due > 0) {
        if (coins >= due) {
          coins -= due
          deficitDays = 0
          toast = `新的一天。维护花了 ${due} 金币。首登 +${DAILY_LOGIN_BONUS}。`
        } else {
          coins = 0
          deficitDays += 1
          toast = '今天的罐头有点紧……多完成几件小事吧。'
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
      toast: '山谷重新铺开了一张白页。',
    }
    set(persist(fresh))
  },
}))

function interact(
  s: GameState,
  npcId: string,
  cost: number,
  gain: { friendship: number; romance: number },
  okToast: string,
): GameState {
  const p = s.npc[npcId]
  if (!p?.met) return { ...s, toast: '还没遇见此人。' }
  if (s.bond < cost) return { ...s, toast: '心意不够了。去做点小事吧。' }
  if (p.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
    return { ...s, toast: '今天先到这儿，明日再来。' }
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
  return persist({
    ...s,
    bond: s.bond - cost,
    npc,
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
