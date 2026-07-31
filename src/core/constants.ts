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
    blurb: '日用每人少花 1，礼物容量 +8',
  },
]

export interface DecorationDef {
  id: string
  name: string
  cost: number
  stage: 0 | 1 | 2 | 3
  asset: string
  blurb: string
}

export const DECORATION_DEFS: DecorationDef[] = [
  { id: 'clay_flowerpot', name: '陶土花盆', cost: 18, stage: 1, asset: 'clay-flowerpot-v1.webp', blurb: '一小盆白花，安静地开着' },
  { id: 'bamboo_lantern', name: '竹编灯', cost: 22, stage: 1, asset: 'bamboo-lantern-v1.webp', blurb: '入夜后有一团柔光' },
  { id: 'wooden_stool', name: '小木凳', cost: 16, stage: 1, asset: 'wooden-stool-v1.webp', blurb: '坐一会儿，看看溪水' },
  { id: 'reed_basket', name: '苇编篮', cost: 14, stage: 1, asset: 'reed-basket-v1.webp', blurb: '能装下刚摘的草叶' },
  { id: 'stone_basin', name: '石水钵', cost: 30, stage: 2, asset: 'stone-basin-v1.webp', blurb: '雨后会留一汪清水' },
  { id: 'firewood_bundle', name: '柴火束', cost: 20, stage: 1, asset: 'firewood-bundle-v1.webp', blurb: '整整齐齐靠在屋边' },
  { id: 'water_jar', name: '青釉水缸', cost: 28, stage: 2, asset: 'water-jar-v1.webp', blurb: '旧青釉上留着手作痕迹' },
  { id: 'wooden_signpost', name: '木路牌', cost: 24, stage: 2, asset: 'wooden-signpost-v1.webp', blurb: '不写字，也知道路通向家' },
  { id: 'potted_bamboo', name: '盆栽细竹', cost: 35, stage: 2, asset: 'potted-bamboo-v1.webp', blurb: '风来时轻轻摇一摇' },
  { id: 'tea_table', name: '双杯茶桌', cost: 40, stage: 3, asset: 'tea-table-v1.webp', blurb: '两只杯子，总有人同坐' },
  { id: 'paper_lantern', name: '落地纸灯', cost: 38, stage: 3, asset: 'paper-lantern-v1.webp', blurb: '留一盏不刺眼的灯' },
  { id: 'wildflower_patch', name: '野花小圃', cost: 32, stage: 2, asset: 'wildflower-patch-v1.webp', blurb: '橙白小花围出一角春天' },
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
    dislikedBy: ['taotao'],
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
    likedBy: ['linchu'],
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
    likedBy: ['taotao'],
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
    likedBy: ['hedeng'],
    blurb: '薄而有韧性的手工纸',
  },
]
