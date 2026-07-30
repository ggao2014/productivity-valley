import type { Difficulty, FriendshipStage, RomanceStage, RoomType } from './types'

export const STARTING_COINS = 40
export const BOND_DAILY_CAP = 10
export const INTERACTIONS_PER_NPC_PER_DAY = 3
export const HOME_FEE = 20
export const DAILY_LOGIN_BONUS = 5

export const TASK_REWARDS: Record<
  Difficulty,
  { coins: number; bond: number; label: string }
> = {
  small: { coins: 10, bond: 1, label: '小' },
  medium: { coins: 25, bond: 2, label: '中' },
  large: { coins: 50, bond: 3, label: '大' },
}

export const FRIENDSHIP_THRESHOLDS: Record<FriendshipStage, number> = {
  0: 0,
  1: 20,
  2: 50,
  3: 90,
}

export const ROMANCE_THRESHOLDS: Record<RomanceStage, number> = {
  0: 0,
  1: 30,
  2: 70,
  3: 120,
  4: 200,
}

export const FRIENDSHIP_LABELS = ['路过', '认识', '好友', '超要好'] as const
export const ROMANCE_LABELS = ['还没有', '有点喜欢', '喜欢', '超喜欢', '在一起'] as const

export const BASE_DAILY_COST = { food: 8, drink: 3, misc: 2 } as const

export interface RoomDef {
  type: RoomType
  name: string
  cost: number
  capacity: number
  blurb: string
}

export const ROOM_DEFS: RoomDef[] = [
  {
    type: 'living',
    name: '客厅',
    cost: 0,
    capacity: 0,
    blurb: '大家待着玩的地方',
  },
  {
    type: 'bedroom',
    name: '卧室',
    cost: 80,
    capacity: 1,
    blurb: '可以住人',
  },
  {
    type: 'guest',
    name: '客房',
    cost: 100,
    capacity: 1,
    blurb: '也可以住人',
  },
  {
    type: 'kitchen',
    name: '厨房',
    cost: 120,
    capacity: 0,
    blurb: '吃饭少花 20%',
  },
  {
    type: 'study',
    name: '书房',
    cost: 150,
    capacity: 0,
    blurb: '中/大任务多赚 10%',
  },
  {
    type: 'storage',
    name: '储藏间',
    cost: 60,
    capacity: 0,
    blurb: '日用每人少花 1',
  },
]

export interface GiftDef {
  id: string
  name: string
  cost: number
  likedBy: string[]
  blurb: string
}

export const GIFT_DEFS: GiftDef[] = [
  {
    id: 'ginger_soup',
    name: '热姜汤',
    cost: 15,
    likedBy: ['shendu'],
    blurb: '暖暖的，沈渡爱喝',
  },
  {
    id: 'wheat_cake',
    name: '麦香饼',
    cost: 15,
    likedBy: ['qinghe'],
    blurb: '脆脆的，青禾爱吃',
  },
  {
    id: 'chestnuts',
    name: '糖炒栗子',
    cost: 20,
    likedBy: ['guwan'],
    blurb: '顾晚的最爱',
  },
  {
    id: 'wood_scrap',
    name: '小木块',
    cost: 25,
    likedBy: ['linchu'],
    blurb: '给林初练手',
  },
  {
    id: 'osmanthus',
    name: '桂花糖',
    cost: 18,
    likedBy: ['jiangxiaoman'],
    blurb: '小满超爱甜的',
  },
  {
    id: 'orange_peel',
    name: '蜜橘皮',
    cost: 18,
    likedBy: ['baizhi'],
    blurb: '白芷会喜欢',
  },
  {
    id: 'trinket',
    name: '小玩意',
    cost: 22,
    likedBy: ['chenshi'],
    blurb: '陈拾看见就双眼放光',
  },
  {
    id: 'cinnabar',
    name: '印泥',
    cost: 30,
    likedBy: ['suweiming'],
    blurb: '苏未名盖章用',
  },
  {
    id: 'bean_bag',
    name: '暖手豆袋',
    cost: 20,
    likedBy: ['yueqingshan'],
    blurb: '打雷时给青衫抱抱',
  },
  {
    id: 'maltose',
    name: '麦芽糖',
    cost: 15,
    likedBy: ['taotao'],
    blurb: '桃桃画糖画用',
  },
  {
    id: 'tea_cake',
    name: '茶饼',
    cost: 35,
    likedBy: ['wenjiu'],
    blurb: '温九泡茶用',
  },
  {
    id: 'lotus_paper',
    name: '莲纸',
    cost: 18,
    likedBy: ['hedeng'],
    blurb: '河灯做灯用',
  },
]
