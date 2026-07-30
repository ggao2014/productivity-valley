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

export const FRIENDSHIP_LABELS = ['路过', '相识', '好友', '挚友'] as const
export const ROMANCE_LABELS = ['未开线', '好感', '心动', '眷恋', '同心'] as const

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
    name: '起居室',
    cost: 0,
    capacity: 0,
    blurb: '小屋的心。家人在这里歇脚。',
  },
  {
    type: 'bedroom',
    name: '卧室',
    cost: 80,
    capacity: 1,
    blurb: '一张床，一扇窗，可以留人过夜。',
  },
  {
    type: 'guest',
    name: '客房',
    cost: 100,
    capacity: 1,
    blurb: '给愿意留下的客人备的被褥。',
  },
  {
    type: 'kitchen',
    name: '厨房',
    cost: 120,
    capacity: 0,
    blurb: '吃的开销减两成。面粉味道会飘出来。',
  },
  {
    type: 'study',
    name: '书房',
    cost: 150,
    capacity: 0,
    blurb: '完成中、大待办时金币多一成。',
  },
  {
    type: 'storage',
    name: '储藏间',
    cost: 60,
    capacity: 0,
    blurb: '每人日用少花一文。',
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
    blurb: '渡口风硬，喝一口暖到胃。',
  },
  {
    id: 'wheat_cake',
    name: '麦香饼',
    cost: 15,
    likedBy: ['qinghe'],
    blurb: '刚出锅，脆边还在响。',
  },
  {
    id: 'chestnuts',
    name: '糖炒栗子',
    cost: 20,
    likedBy: ['guwan'],
    blurb: '烫手，却忍不住连剥。',
  },
  {
    id: 'wood_scrap',
    name: '好木料角',
    cost: 25,
    likedBy: ['linchu'],
    blurb: '纹理顺，适合练手。',
  },
  {
    id: 'osmanthus',
    name: '桂花糖',
    cost: 18,
    likedBy: ['jiangxiaoman'],
    blurb: '甜得正经，不糊锅。',
  },
  {
    id: 'orange_peel',
    name: '蜜渍橘皮',
    cost: 18,
    likedBy: ['baizhi'],
    blurb: '药香与甜缠在一起。',
  },
  {
    id: 'trinket',
    name: '古怪小玩意',
    cost: 22,
    likedBy: ['chenshi'],
    blurb: '说不清用途，但很有故事。',
  },
  {
    id: 'cinnabar',
    name: '朱砂印泥',
    cost: 30,
    likedBy: ['suweiming'],
    blurb: '盖在话本末页刚刚好。',
  },
  {
    id: 'bean_bag',
    name: '暖豆袋',
    cost: 20,
    likedBy: ['yueqingshan'],
    blurb: '雷雨夜捂在手里就不那么怕。',
  },
  {
    id: 'maltose',
    name: '麦芽糖块',
    cost: 15,
    likedBy: ['taotao'],
    blurb: '拉丝时能画出兔子耳朵。',
  },
  {
    id: 'tea_cake',
    name: '陈年茶饼',
    cost: 35,
    likedBy: ['wenjiu'],
    blurb: '泡开后有旧宅的味道。',
  },
  {
    id: 'lotus_paper',
    name: '莲纸',
    cost: 18,
    likedBy: ['hedeng'],
    blurb: '遇水不烂，适合做河灯。',
  },
]
