import type { CourtyardLevel, Difficulty, FriendshipStage, RomanceStage, RoomLevel, RoomType } from './types'

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
    name: '正房',
    cost: 0,
    capacity: 0,
    blurb: '你的房间',
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
    blurb: '手册；升级后增加项目奖励',
  },
  {
    type: 'storage',
    name: '库房',
    cost: 60,
    capacity: 0,
    blurb: '物品；升级后扩容并减少日用',
  },
]

export const ROOM_LEVEL_LABELS: Record<RoomLevel, string> = {
  1: '简屋',
  2: '瓦房',
  3: '雅室',
  4: '院居',
}

export const ROOM_UPGRADE_COSTS: Record<RoomType, Partial<Record<1 | 2 | 3, number>>> = {
  living: { 1: 50, 2: 120 },
  bedroom: { 1: 60, 2: 120, 3: 300 },
  guest: { 1: 70, 2: 140 },
  kitchen: { 1: 90, 2: 180 },
  study: { 1: 110, 2: 220 },
  storage: { 1: 50, 2: 100 },
}

export const COURTYARD_LEVELS: Record<CourtyardLevel, {
  name: string
  capacity: number
  upgradeCost: number | null
}> = {
  1: { name: '小院', capacity: 2, upgradeCost: 100 },
  2: { name: '三合院', capacity: 4, upgradeCost: 220 },
  3: { name: '四合院', capacity: 8, upgradeCost: 480 },
  4: { name: '二进院', capacity: 13, upgradeCost: null },
}

export const ROOM_TYPE_LIMITS: Partial<Record<RoomType, number>> = {
  guest: 1,
  kitchen: 1,
  study: 1,
  storage: 1,
}

export interface DecorationDef {
  id: string
  name: string
  cost: number
  stage: 0 | 1 | 2 | 3
  asset: string
  blurb: string
}

export const DECORATION_DEFS: DecorationDef[] = [
  { id: 'clay_flowerpot', name: '陶土花盆', cost: 18, stage: 1, asset: 'clay-flowerpot-v1.webp', blurb: '种有白色小花的陶盆' },
  { id: 'bamboo_lantern', name: '竹编灯', cost: 22, stage: 1, asset: 'bamboo-lantern-v1.webp', blurb: '夜间会亮的竹编灯' },
  { id: 'wooden_stool', name: '小木凳', cost: 16, stage: 1, asset: 'wooden-stool-v1.webp', blurb: '放在溪边的小木凳' },
  { id: 'reed_basket', name: '苇编篮', cost: 14, stage: 1, asset: 'reed-basket-v1.webp', blurb: '用芦苇编成的提篮' },
  { id: 'stone_basin', name: '石水钵', cost: 30, stage: 2, asset: 'stone-basin-v1.webp', blurb: '可以接雨水的石钵' },
  { id: 'firewood_bundle', name: '柴火束', cost: 20, stage: 1, asset: 'firewood-bundle-v1.webp', blurb: '捆扎整齐的柴火' },
  { id: 'water_jar', name: '青釉水缸', cost: 28, stage: 2, asset: 'water-jar-v1.webp', blurb: '带青色釉面的水缸' },
  { id: 'wooden_signpost', name: '木路牌', cost: 24, stage: 2, asset: 'wooden-signpost-v1.webp', blurb: '放在路边的木制路牌' },
  { id: 'potted_bamboo', name: '盆栽细竹', cost: 35, stage: 2, asset: 'potted-bamboo-v1.webp', blurb: '一盆细竹' },
  { id: 'tea_table', name: '双杯茶桌', cost: 40, stage: 3, asset: 'tea-table-v1.webp', blurb: '摆有两只茶杯的小桌' },
  { id: 'paper_lantern', name: '落地纸灯', cost: 38, stage: 3, asset: 'paper-lantern-v1.webp', blurb: '低亮度的落地纸灯' },
  { id: 'wildflower_patch', name: '野花小圃', cost: 32, stage: 2, asset: 'wildflower-patch-v1.webp', blurb: '一片橙白色野花' },
]

export interface GiftDef {
  id: string
  name: string
  cost: number
  likedBy: string[]
  dislikedBy?: string[]
  blurb: string
}

export const GIFT_DEFS: GiftDef[] = [
  {
    id: 'ginger_soup',
    name: '热姜汤',
    cost: 15,
    likedBy: ['shendu'],
    blurb: '辛香暖胃，适合凉天',
  },
  {
    id: 'wheat_cake',
    name: '麦香饼',
    cost: 15,
    likedBy: ['qinghe'],
    blurb: '麦香酥脆，朴素耐放',
  },
  {
    id: 'chestnuts',
    name: '糖炒栗子',
    cost: 20,
    likedBy: ['guwan'],
    blurb: '纸袋里还带着余温',
  },
  {
    id: 'wood_scrap',
    name: '小木块',
    cost: 25,
    likedBy: ['linchu', 'taotao'],
    blurb: '纹理漂亮的一小截木料',
  },
  {
    id: 'osmanthus',
    name: '桂花糖',
    cost: 18,
    likedBy: ['jiangxiaoman'],
    blurb: '清甜柔软，带一点花香',
  },
  {
    id: 'orange_peel',
    name: '蜜橘皮',
    cost: 18,
    likedBy: ['baizhi'],
    blurb: '酸甜清香，晒得刚好',
  },
  {
    id: 'trinket',
    name: '小玩意',
    cost: 22,
    likedBy: ['chenshi'],
    dislikedBy: ['shendu'],
    blurb: '叫不出名字的有趣物件',
  },
  {
    id: 'cinnabar',
    name: '印泥',
    cost: 30,
    likedBy: ['suweiming'],
    blurb: '颜色沉稳的一盒印泥',
  },
  {
    id: 'bean_bag',
    name: '暖手豆袋',
    cost: 20,
    likedBy: ['yueqingshan'],
    blurb: '柔软温热，可以握在掌心',
  },
  {
    id: 'maltose',
    name: '麦芽糖',
    cost: 15,
    likedBy: [],
    dislikedBy: ['guwan'],
    blurb: '甜而不腻，能拉出细丝',
  },
  {
    id: 'tea_cake',
    name: '茶饼',
    cost: 35,
    likedBy: ['wenjiu'],
    dislikedBy: ['taotao'],
    blurb: '陈香微苦，适合慢慢泡',
  },
  {
    id: 'lotus_paper',
    name: '莲纸',
    cost: 18,
    likedBy: ['hedeng', 'taotao'],
    blurb: '薄而有韧性的手工纸',
  },
]
