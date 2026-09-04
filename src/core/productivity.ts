import type {
  Difficulty,
  Habit,
  HabitCountPeriod,
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

export function monthKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function dateFromDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T12:00:00`)
}

export function habitCountPeriod(habit: Pick<Habit, 'mode' | 'countPeriod'>): HabitCountPeriod {
  if (habit.mode !== 'count') return 'day'
  return habit.countPeriod ?? 'day'
}

function weekDates(now = new Date()): Date[] {
  const start = new Date(`${mondayKey(now)}T12:00:00`)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function monthDates(now = new Date()): Date[] {
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 12)
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start)
    date.setDate(1 + index)
    return date
  })
}

export function habitPeriodDayKeys(habit: Habit, now = new Date()): Set<string> {
  const period = habitCountPeriod(habit)
  if (period === 'week') {
    return new Set(weekDates(now).map((date) => localDayKey(date)))
  }
  if (period === 'month') {
    return new Set(monthDates(now).map((date) => localDayKey(date)))
  }
  return new Set([localDayKey(now)])
}

/** Total logged counts inside the active day/week/month window. */
export function habitPeriodCount(habit: Habit, now = new Date()): number {
  const keys = habitPeriodDayKeys(habit, now)
  return habit.entries.reduce(
    (sum, entry) => (keys.has(entry.dayKey) ? sum + entry.count : sum),
    0,
  )
}

export function habitDueOn(habit: Habit, now = new Date()): boolean {
  if (!habit.active) return false
  if (habit.mode === 'count') return true
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
  if (habit.mode === 'count') {
    const period = habitCountPeriod(habit)
    if (period === 'day') {
      return (habitEntryFor(habit, dayKey)?.count ?? 0) >= habit.targetCount
    }
    return habitPeriodCount(habit, dateFromDayKey(dayKey)) >= habit.targetCount
  }
  return (habitEntryFor(habit, dayKey)?.count ?? 0) >= habit.targetCount
}

export function habitWeeklyTarget(habit: Habit, now = new Date()): number {
  if (habit.mode === 'count' && habitCountPeriod(habit) !== 'day') {
    return Math.max(1, habit.targetCount)
  }
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
  if (habit.mode === 'count') {
    const period = habitCountPeriod(habit)
    if (period === 'week') {
      return {
        completed: habitPeriodCount(habit, now),
        target: Math.max(1, habit.targetCount),
      }
    }
    if (period === 'month') {
      return {
        completed: habitPeriodCount(habit, now),
        target: Math.max(1, habit.targetCount),
      }
    }
  }
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

/** Calendar cadence for check-mode habits. */
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

export function habitCountPeriodLabel(period: HabitCountPeriod): string {
  if (period === 'week') return '每周'
  if (period === 'month') return '每月'
  return '每天'
}

export function habitSummaryLabel(
  habit: Pick<Habit, 'mode' | 'targetCount' | 'schedule' | 'countPeriod'>,
): string {
  if (habit.mode === 'count') {
    return `${habitCountPeriodLabel(habitCountPeriod(habit))} ${habit.targetCount} 次`
  }
  return `${habitScheduleLabel(habit.schedule)} · 打卡`
}

export function habitProgressLabel(habit: Habit, now = new Date()): string {
  const progress = habitWeeklyProgress(habit, now)
  if (habit.mode === 'count') {
    const period = habitCountPeriod(habit)
    if (period === 'week') return `本周 ${progress.completed}/${progress.target} 次`
    if (period === 'month') return `本月 ${progress.completed}/${progress.target} 次`
    return `本周完成 ${progress.completed}/${progress.target} 天`
  }
  return `本周完成 ${progress.completed}/${progress.target} 天`
}

/** Today-list progress text for an open/done habit row. */
export function habitTodayProgressLabel(habit: Habit, dayKey = localDayKey()): string {
  if (habit.mode !== 'count') {
    const count = habitEntryFor(habit, dayKey)?.count ?? 0
    return count > 0 ? '已打卡 · 习惯' : '打卡 · 习惯'
  }
  const period = habitCountPeriod(habit)
  const now = dateFromDayKey(dayKey)
  if (period === 'day') {
    const count = habitEntryFor(habit, dayKey)?.count ?? 0
    return `${count}/${habit.targetCount} 次 · 习惯`
  }
  const count = habitPeriodCount(habit, now)
  const scope = period === 'week' ? '本周' : '本月'
  return `${count}/${habit.targetCount} 次 · ${scope}`
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
