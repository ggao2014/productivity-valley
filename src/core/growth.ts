import { friendshipStage, partnerIds } from './economy'
import type { GameState, MilestoneId, Task } from './types'

export type ValleyStage = 0 | 1 | 2 | 3

export const VALLEY_STAGES = [
  { name: '荒地', threshold: 0, description: '完成待办以开始建设' },
  { name: '初步修整', threshold: 6, description: '已修好小路和基础屋舍' },
  { name: '完善小屋', threshold: 18, description: '已解锁更多房间和访客' },
  { name: '完整住处', threshold: 36, description: '房屋与主要生活设施已经齐全' },
] as const

export const MILESTONES: Array<{
  id: MilestoneId
  name: string
  detail: string
  asset: string
}> = [
  { id: 'first_task', name: '首项完成', detail: '完成第一件待办', asset: 'first-task-v1.webp' },
  { id: 'tasks_10', name: '完成 10 项', detail: '完成 10 件待办', asset: 'tasks-10-v1.webp' },
  { id: 'tasks_25', name: '完成 25 项', detail: '完成 25 件待办', asset: 'tasks-25-v1.webp' },
  { id: 'first_room', name: '首次扩建', detail: '第一次扩建房间', asset: 'first-room-v1.webp' },
  { id: 'first_friend', name: '首位好友', detail: '拥有第一位熟悉的朋友', asset: 'first-friend-v1.webp' },
  { id: 'first_partner', name: '首次入住', detail: '第一次邀请伴侣入住', asset: 'first-partner-v1.webp' },
]

export function completedTaskCount(tasks: Task[]): number {
  return tasks.filter((task) => task.done && task.completedAt).length
}

export function valleyGrowthPoints(state: GameState): number {
  const tasks = completedTaskCount(state.tasks)
  const habitDays = state.habits.reduce((total, habit) => {
    const period = habit.mode === 'count' ? habit.countPeriod ?? 'day' : 'day'
    if (habit.mode === 'count' && period !== 'day') {
      return (
        total + habit.entries.filter((entry) => Boolean(entry.completedAt)).length
      )
    }
    return (
      total + habit.entries.filter((entry) => entry.count >= habit.targetCount).length
    )
  }, 0)
  const projectBlocks = state.projects.reduce(
    (total, project) => total + project.blocks.filter((block) => block.done).length,
    0,
  )
  const rooms = state.rooms.filter((room) => room.type !== 'living').length
  const friends = Object.values(state.npc).filter(
    (progress) => friendshipStage(progress.friendshipPoints) >= 2,
  ).length
  return (
    tasks +
    habitDays +
    projectBlocks * 2 +
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

export function giftCapacity(state: Pick<GameState, 'rooms'>): number {
  const storageLevel = state.rooms.find((room) => room.type === 'storage')?.level ?? 1
  return 8 + Math.max(0, storageLevel - 1) * 4
}

export function inventoryCount(state: Pick<GameState, 'inventory'>): number {
  return state.inventory.reduce((total, item) => total + item.qty, 0)
}
