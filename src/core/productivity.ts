import type {
  Difficulty,
  Habit,
  HabitSchedule,
  Project,
  ProjectMilestone,
  ProjectSize,
} from './types'
import { localDayKey } from './economy'

export const HABIT_REWARD = { coins: 8, bond: 1 }
export const HABIT_WEEKLY_REWARD = { coins: 20, bond: 1 }
export const HABIT_REWARD_SLOTS = 5

export const PROJECT_REWARDS: Record<
  ProjectSize,
  {
    coins: number
    bond: number
    minBlocks: number
    blockCoins: number
    blockBond: number
    milestones: Record<ProjectMilestone, { coins: number; bond: number }>
  }
> = {
  small: {
    coins: 120,
    bond: 6,
    minBlocks: 2,
    blockCoins: 84,
    blockBond: 3,
    milestones: {
      25: { coins: 6, bond: 0 },
      50: { coins: 6, bond: 1 },
      75: { coins: 6, bond: 1 },
      100: { coins: 18, bond: 1 },
    },
  },
  medium: {
    coins: 300,
    bond: 12,
    minBlocks: 4,
    blockCoins: 210,
    blockBond: 6,
    milestones: {
      25: { coins: 15, bond: 1 },
      50: { coins: 15, bond: 1 },
      75: { coins: 15, bond: 1 },
      100: { coins: 45, bond: 3 },
    },
  },
  large: {
    coins: 600,
    bond: 20,
    minBlocks: 6,
    blockCoins: 420,
    blockBond: 10,
    milestones: {
      25: { coins: 30, bond: 1 },
      50: { coins: 30, bond: 2 },
      75: { coins: 30, bond: 2 },
      100: { coins: 90, bond: 5 },
    },
  },
}

export const BLOCK_WEIGHTS: Record<Difficulty, number> = {
  small: 1,
  medium: 2,
  large: 3,
}

export function mondayKey(now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - weekday)
  return localDayKey(date)
}

export function habitDueOn(habit: Habit, now = new Date()): boolean {
  if (!habit.active) return false
  const day = now.getDay()
  if (habit.schedule.type === 'daily') return true
  if (habit.schedule.type === 'weekdays') return day >= 1 && day <= 5
  if (habit.schedule.type === 'selected') {
    return (habit.schedule.days ?? []).includes(day)
  }
  if (habit.schedule.type === 'weekly') {
    return habitWeeklyProgress(habit, now).completed < habitWeeklyTarget(habit, now)
  }
  return false
}

export function habitEntryFor(habit: Habit, dayKey = localDayKey()) {
  return habit.entries.find((entry) => entry.dayKey === dayKey)
}

export function habitCompletedOn(habit: Habit, dayKey = localDayKey()): boolean {
  return (habitEntryFor(habit, dayKey)?.count ?? 0) >= habit.targetCount
}

function weekDates(now = new Date()): Date[] {
  const start = new Date(`${mondayKey(now)}T12:00:00`)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export function habitWeeklyTarget(habit: Habit, now = new Date()): number {
  if (habit.schedule.type === 'weekly') {
    return Math.max(1, habit.schedule.weeklyTarget ?? 1)
  }
  const created = new Date(habit.createdAt)
  return Math.max(
    1,
    weekDates(now).filter((date) => date >= new Date(created.getFullYear(), created.getMonth(), created.getDate()) && habitDueOn(habit, date)).length,
  )
}

export function habitWeeklyProgress(habit: Habit, now = new Date()) {
  const keys = new Set(weekDates(now).map((date) => localDayKey(date)))
  return {
    completed: habit.entries.filter(
      (entry) => keys.has(entry.dayKey) && entry.count >= habit.targetCount,
    ).length,
    target: habitWeeklyTarget(habit, now),
  }
}

const HABIT_WEEKDAY_LABELS: Record<number, string> = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
}

/** Calendar cadence only — “天” not “次”, to avoid colliding with daily count targets. */
export function habitScheduleLabel(schedule: HabitSchedule): string {
  if (schedule.type === 'daily') return '每天'
  if (schedule.type === 'weekdays') return '工作日'
  if (schedule.type === 'weekly') return `每周 ${schedule.weeklyTarget ?? 1} 天`
  const days = [...(schedule.days ?? [])].sort((a, b) => {
    const rank = (day: number) => (day === 0 ? 7 : day)
    return rank(a) - rank(b)
  })
  if (days.length === 0) return '指定星期'
  return `周${days.map((day) => HABIT_WEEKDAY_LABELS[day] ?? day).join('、')}`
}

/** How the habit is logged within a due day. */
export function habitModeLabel(habit: Pick<Habit, 'mode' | 'targetCount'>): string {
  if (habit.mode === 'count') return `每天 ${habit.targetCount} 次`
  return '打卡'
}

export function habitSummaryLabel(habit: Pick<Habit, 'mode' | 'targetCount' | 'schedule'>): string {
  return `${habitScheduleLabel(habit.schedule)} · ${habitModeLabel(habit)}`
}


export function projectProgress(project: Project) {
  const total = project.blocks.reduce(
    (sum, block) => sum + BLOCK_WEIGHTS[block.difficulty],
    0,
  )
  const completed = project.blocks.reduce(
    (sum, block) => sum + (block.done ? BLOCK_WEIGHTS[block.difficulty] : 0),
    0,
  )
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function crossedMilestones(before: number, after: number): ProjectMilestone[] {
  return ([25, 50, 75, 100] as ProjectMilestone[]).filter(
    (milestone) => before < milestone && after >= milestone,
  )
}

export function nextOpenBlock(project: Project) {
  return project.blocks.find((block) => !block.done)
}

export function nextBlockReward(project: Project, blockId: string) {
  const config = PROJECT_REWARDS[project.size]
  const block = project.blocks.find((item) => item.id === blockId)
  if (!block || block.done || block.awardedCoins !== undefined) {
    return { coins: 0, bond: 0 }
  }
  const paidCoins = project.blocks.reduce(
    (sum, item) => sum + (item.awardedCoins ?? 0),
    0,
  )
  const paidBond = project.blocks.reduce(
    (sum, item) => sum + (item.awardedBond ?? 0),
    0,
  )
  const unfinished = project.blocks.filter((item) => !item.done)
  const remainingWeight = unfinished.reduce(
    (sum, item) => sum + BLOCK_WEIGHTS[item.difficulty],
    0,
  )
  const weight = BLOCK_WEIGHTS[block.difficulty]
  const last = unfinished.length === 1
  const remainingCoins = Math.max(0, config.blockCoins - paidCoins)
  const remainingBond = Math.max(0, config.blockBond - paidBond)
  return {
    coins: last
      ? remainingCoins
      : Math.floor((remainingCoins * weight) / remainingWeight),
    bond: last
      ? remainingBond
      : Math.floor((remainingBond * weight) / remainingWeight),
  }
}
