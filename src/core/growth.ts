import { friendshipStage, partnerIds } from './economy'
import type { GameState, MilestoneId, Task } from './types'

export type ValleyStage = 0 | 1 | 2 | 3

export const VALLEY_STAGES = [
  { name: '荒地', threshold: 0, description: '一块等人慢慢照料的土地' },
  { name: '初步修整', threshold: 6, description: '小路与屋舍有了生活的轮廓' },
  { name: '温暖小屋', threshold: 18, description: '灯火、房间与来客渐渐齐全' },
  { name: '有人生活的家', threshold: 36, description: '这里已经留下共同生活的痕迹' },
] as const

export const MILESTONES: Array<{
  id: MilestoneId
  name: string
  detail: string
  asset: string
}> = [
  { id: 'first_task', name: '第一步', detail: '完成第一件待办', asset: 'first-task-v1.webp' },
  { id: 'tasks_10', name: '渐入佳境', detail: '完成 10 件待办', asset: 'tasks-10-v1.webp' },
  { id: 'tasks_25', name: '日积月累', detail: '完成 25 件待办', asset: 'tasks-25-v1.webp' },
  { id: 'first_room', name: '添一间房', detail: '第一次扩建房间', asset: 'first-room-v1.webp' },
  { id: 'first_friend', name: '两杯茶', detail: '拥有第一位熟悉的朋友', asset: 'first-friend-v1.webp' },
  { id: 'first_partner', name: '一盏灯', detail: '第一次邀请伴侣入住', asset: 'first-partner-v1.webp' },
]

export function completedTaskCount(tasks: Task[]): number {
  return tasks.filter((task) => task.done && task.completedAt).length
}

export function valleyGrowthPoints(state: GameState): number {
  const tasks = completedTaskCount(state.tasks)
  const rooms = state.rooms.filter((room) => room.type !== 'living').length
  const friends = Object.values(state.npc).filter(
    (progress) => friendshipStage(progress.friendshipPoints) >= 2,
  ).length
  return (
    tasks +
    rooms * 4 +
    friends * 3 +
    partnerIds(state).length * 8 +
    state.decorations.length
  )
}

export function valleyStage(state: GameState): ValleyStage {
  const points = valleyGrowthPoints(state)
  if (points >= VALLEY_STAGES[3].threshold && partnerIds(state).length > 0) return 3
  if (points >= VALLEY_STAGES[2].threshold) return 2
  if (points >= VALLEY_STAGES[1].threshold) return 1
  return 0
}

export function earnedMilestones(state: GameState): MilestoneId[] {
  const tasks = completedTaskCount(state.tasks)
  const rooms = state.rooms.some((room) => room.type !== 'living')
  const friend = Object.values(state.npc).some(
    (progress) => friendshipStage(progress.friendshipPoints) >= 2,
  )
  const partner = partnerIds(state).length > 0
  return [
    ...(tasks >= 1 ? ['first_task' as const] : []),
    ...(tasks >= 10 ? ['tasks_10' as const] : []),
    ...(tasks >= 25 ? ['tasks_25' as const] : []),
    ...(rooms ? ['first_room' as const] : []),
    ...(friend ? ['first_friend' as const] : []),
    ...(partner ? ['first_partner' as const] : []),
  ]
}

export function nextValleyGoal(state: GameState): string {
  const stage = valleyStage(state)
  const points = valleyGrowthPoints(state)
  if (stage === 3) return '山谷已成家。接下来，用装饰留下你们自己的生活痕迹。'
  if (stage === 2 && partnerIds(state).length === 0) {
    return '下一步：和喜欢的人继续靠近，准备一张空床，邀请对方入住。'
  }
  const target = VALLEY_STAGES[stage + 1].threshold
  return `下一阶段还需 ${Math.max(0, target - points)} 点成长：完成待办 +1，扩建房间 +4，结交好友 +3。`
}

export function weeklyProgress(tasks: Task[], now = new Date()) {
  return weeklyProgressAtOffset(tasks, 0, now)
}

export function weeklyProgressAtOffset(
  tasks: Task[],
  weeksAgo: number,
  now = new Date(),
) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - weekday - weeksAgo * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const completed = tasks.filter((task) => {
    if (!task.done || !task.completedAt) return false
    const date = new Date(task.completedAt)
    return date >= start && date < end
  })
  const activeDays = new Set(
    completed.map((task) => {
      const date = new Date(task.completedAt!)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }),
  ).size
  return { completed: completed.length, activeDays, taskGoal: 5, dayGoal: 3 }
}

export function gentleWeeklySummary(tasks: Task[], now = new Date()): string {
  const week = weeklyProgressAtOffset(tasks, 1, now)
  if (week.completed === 0) {
    return '上周没有留下记录也没关系。山谷不会催促你，今天回来就算新的开始。'
  }
  if (week.activeDays >= week.dayGoal || week.completed >= week.taskGoal) {
    return `上周完成 ${week.completed} 件待办，在 ${week.activeDays} 天留下了脚印。山谷记住了这份稳定。`
  }
  return `上周完成 ${week.completed} 件待办，在 ${week.activeDays} 天照料过山谷。每一次回来都算数。`
}

export function giftCapacity(state: Pick<GameState, 'rooms'>): number {
  const storageRooms = state.rooms.filter((room) => room.type === 'storage').length
  return 8 + storageRooms * 8
}

export function inventoryCount(state: Pick<GameState, 'inventory'>): number {
  return state.inventory.reduce((total, item) => total + item.qty, 0)
}
