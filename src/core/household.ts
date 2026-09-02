import type { ChoreFrequency, ChorePreference, CustomChore } from './types'
import { localDayKey } from './economy'

export type HomeFloor = 'first' | 'second'

export interface ChoreDefinition {
  id: string
  title: string
  frequency: ChoreFrequency
  details: string[]
  enabled?: boolean
  includeInToday?: boolean
}

export interface HomeRoomDefinition {
  id: string
  name: string
  mapName?: string
  floor: HomeFloor
  mapClass: string
  chores: ChoreDefinition[]
}

const chore = (id: string, title: string, frequency: ChoreFrequency, details: string[]): ChoreDefinition => ({ id, title, frequency, details })

export const HOME_ROOMS: HomeRoomDefinition[] = [
  { id: 'living-dining', name: '一楼客厅 / 餐厅', mapName: '客厅 / 餐厅', floor: 'first', mapClass: 'living-dining', chores: [
    chore('living-reset', '收好散落物与宠物用品', 'daily', ['散落物品', '宠物用品', '宠物毛聚集处']),
    chore('living-surfaces', '整理桌面与沙发', 'weekly', ['沙发与靠枕', '茶几', '餐桌与餐椅', '电视柜', '木柜顶部']),
    chore('living-floors', '清洁客餐厅地面', 'weekly', ['木地板', '红色大地毯', '白色地毯', '沙发底部']),
    chore('living-deep', '清洁窗户与边角', 'monthly', ['窗台', '百叶窗', '玻璃门与轨道', '墙角', '踢脚线', '家具底部']),
  ]},
  { id: 'kitchen', name: '厨房', floor: 'first', mapClass: 'kitchen', chores: [
    chore('kitchen-reset', '恢复厨房台面', 'daily', ['岛台与料理台', '水槽与水龙头', '瓶罐与调料', '食品及杂物堆积处']),
    chore('kitchen-cook', '清洁烹饪区', 'weekly', ['炉灶及周围', 'backsplash', '微波炉内外', '小家电']),
    chore('kitchen-floor', '清洁地面与垃圾区', 'weekly', ['木地板', '垃圾桶及周围', '岛台下方', '墙角']),
    chore('kitchen-appliances', '维护厨房电器', 'monthly', ['冰箱内部及周围', '洗碗机滤网', '烤箱内部', '冰箱顶部']),
    chore('kitchen-cabinets', '深度清洁橱柜', 'seasonal', ['橱柜门与把手', '橱柜顶部', '橱柜踢脚处']),
  ]},
  { id: 'powder-room', name: '一楼客卫', mapName: '客卫', floor: 'first', mapClass: 'powder-room', chores: [
    chore('powder-reset', '快速整理客卫', 'weekly', ['洗手池边缘', '毛巾', '卫生纸', '垃圾桶']),
    chore('powder-clean', '清洁洗手池与马桶', 'weekly', ['洗手池与水龙头', '镜子', '马桶内外']),
    chore('powder-deep', '清洁地面与边角', 'monthly', ['木地板与地垫', '窗台与百叶窗', '门把手', '踢脚线', '通风口']),
  ]},
  { id: 'study', name: '二楼书房', mapName: '书房 / Loft', floor: 'second', mapClass: 'study', chores: [
    chore('study-reset', '整理书桌与散落物', 'weekly', ['书桌桌面', '电线周围', '垃圾与散落物品']),
    chore('study-dust', '清洁书房表面', 'weekly', ['电脑设备', '书柜与书籍', '画架', '置物架与椅子']),
    chore('study-pets', '整理猫咪区域', 'weekly', ['猫窝', '猫爬架', '猫用品周围']),
    chore('study-deep', '书房深度除尘', 'monthly', ['地毯', '植物', '窗台与百叶窗', '吊扇', '踢脚线与家具底部']),
  ]},
  { id: 'laundry', name: '二楼洗衣房', mapName: '洗衣房', floor: 'second', mapClass: 'laundry', chores: [
    chore('laundry-reset', '归拢衣物与用品', 'weekly', ['洗衣篮', '散落衣物与床品', '清洁用品周围']),
    chore('laundry-machines', '清洁洗衣设备', 'weekly', ['洗衣机与烘干机表面', '洗涤剂槽', '盖板与边缘', 'lint trap']),
    chore('laundry-deep', '清洁洗衣房边角', 'monthly', ['地面', '机器间缝隙及底部', '置物架', '通风口', '踢脚线']),
  ]},
  { id: 'guest-bath', name: '二楼客卫', mapName: '客卫', floor: 'second', mapClass: 'guest-bath', chores: [
    chore('guest-bath-reset', '快速整理客卫', 'weekly', ['洗手台', '毛巾', '浴室地垫', '垃圾桶']),
    chore('guest-bath-clean', '清洁卫浴设施', 'weekly', ['洗手池与镜子', '马桶内外', '浴缸与龙头', '浴缸墙面']),
    chore('guest-bath-deep', '客卫深度清洁', 'monthly', ['浴帘与浴帘杆', '用品架', '窗台与百叶窗', '地面', '踢脚线', '通风口']),
  ]},
  { id: 'guest-bedroom', name: '客卧 / 游戏房', mapName: '客卧 / 游戏房', floor: 'second', mapClass: 'guest-bedroom', chores: [
    chore('guest-room-reset', '整理客卧与游戏区', 'weekly', ['床与床品', '桌面与椅子', '游戏设备', '散落物品']),
    chore('guest-room-dust', '清洁家具与电子设备', 'monthly', ['电视与电视柜', '床头板', '植物', '窗台与窗帘', '灯带周围']),
    chore('guest-room-deep', '客卧深度清洁', 'seasonal', ['地板', '床底', '家具底部', '门与门把手', '踢脚线']),
  ]},
  { id: 'primary-bedroom', name: '主卧', floor: 'second', mapClass: 'primary-bedroom', chores: [
    chore('primary-reset', '整理主卧', 'daily', ['床', '散落衣物', '鞋子与拖鞋', '床头柜']),
    chore('primary-bedding', '更换与整理床品', 'weekly', ['床单', '被套与被子', '枕套', '床周围地面']),
    chore('primary-dust', '主卧除尘', 'monthly', ['床架与床底', '窗台与窗帘', '植物', '家具顶部与底部', '踢脚线']),
    chore('primary-air', '维护卧室设备', 'seasonal', ['空气净化器滤网', '吊扇叶片']),
  ]},
  { id: 'primary-bathroom', name: '主卫', floor: 'second', mapClass: 'primary-bathroom', chores: [
    chore('primary-bath-reset', '整理主卫台面', 'weekly', ['洗手台台面', '护肤品与洗漱用品周围', '毛巾', '垃圾桶']),
    chore('primary-bath', '清洁主卫', 'weekly', ['双洗手池与镜子', '马桶内外', '淋浴房与玻璃', '浴缸', '地面与地垫']),
    chore('primary-maintenance', '主卫深度清洁', 'monthly', ['淋浴轨道与花洒', '浴缸边缘与瓶罐', '植物与窗台', '百叶窗', '通风口', '踢脚线']),
  ]},
]

export const FREQUENCY_LABELS: Record<ChoreFrequency, string> = {
  daily: '每日', weekly: '每周', monthly: '每月', seasonal: '每季', 'as-needed': '按需',
}

export function configuredHomeRooms(preferences: Record<string, ChorePreference> = {}, customChores: CustomChore[] = []): HomeRoomDefinition[] {
  return HOME_ROOMS.map((room) => ({
    ...room,
    chores: [
      ...room.chores.map((item) => ({
        ...item,
        ...preferences[item.id],
        details: preferences[item.id]?.details ?? item.details,
        enabled: preferences[item.id]?.enabled ?? true,
        includeInToday: preferences[item.id]?.includeInToday ?? item.frequency !== 'as-needed',
      })),
      ...customChores.filter((item) => item.roomId === room.id).map(({ roomId: _roomId, ...item }) => ({ ...item, ...preferences[item.id], details: preferences[item.id]?.details ?? item.details })),
    ],
  }))
}

const frequencyDays: Partial<Record<ChoreFrequency, number>> = { daily: 1, weekly: 7, monthly: 30, seasonal: 90 }

export function choreIsDue(frequency: ChoreFrequency, completedAt?: string, now = new Date()): boolean {
  if (frequency === 'as-needed') return false
  if (!completedAt) return true
  const completed = new Date(completedAt)
  if (frequency === 'daily') return completed.toDateString() !== now.toDateString()
  return now.getTime() - completed.getTime() >= (frequencyDays[frequency] ?? 1) * 86_400_000
}

export function roomMaintenance(room: HomeRoomDefinition, completions: Record<string, { completedAt: string }>, now = new Date()): number {
  const scheduled = room.chores.filter((item) => item.enabled !== false && item.frequency !== 'as-needed')
  if (!scheduled.length) return 100
  const current = scheduled.filter((item) => !choreIsDue(item.frequency, completions[item.id]?.completedAt, now)).length
  return Math.round(current / scheduled.length * 100)
}

const intervalDays: Record<Exclude<ChoreFrequency, 'as-needed'>, number> = { daily: 1, weekly: 7, monthly: 30, seasonal: 90 }

/** Freeze at most two due periodic routines for the day. The second prefers the
 * same room as the first, so a useful cleaning session stays spatially focused. */
export function buildDailyChorePlan(completions: Record<string, { completedAt: string }>, now = new Date(), rooms: HomeRoomDefinition[] = HOME_ROOMS) {
  const candidates = rooms.flatMap((room, roomIndex) => room.chores
    .filter((item) => item.enabled !== false && item.includeInToday !== false && item.frequency !== 'daily' && item.frequency !== 'as-needed' && choreIsDue(item.frequency, completions[item.id]?.completedAt, now))
    .map((item) => {
      const completedAt = completions[item.id]?.completedAt
      const interval = intervalDays[item.frequency as Exclude<ChoreFrequency, 'as-needed'>]
      const elapsed = completedAt ? (now.getTime() - new Date(completedAt).getTime()) / 86_400_000 : interval
      return { item, roomId: room.id, roomIndex, urgency: elapsed / interval }
    }))
    .sort((a, b) => b.urgency - a.urgency || a.roomIndex - b.roomIndex || a.item.id.localeCompare(b.item.id))

  const first = candidates[0]
  const second = first
    ? candidates.slice(1).find((entry) => entry.roomId === first.roomId) ?? candidates[1]
    : undefined
  return { dayKey: localDayKey(now), choreIds: [first?.item.id, second?.item.id].filter((id): id is string => Boolean(id)) }
}
