import type { GameIconName } from '../assets/icons/GameIcon'
import { localDayKey } from './economy'
import { addDaysToDayKey } from './plan'
import { BLOCK_WEIGHTS, mondayKey } from './productivity'
import { taskCategory } from './taskCategories'
import type {
  Difficulty,
  GameState,
  Habit,
  NpcProgress,
  Project,
  Task,
  TaskCategory,
} from './types'

export const INK_ACTIVITY = ['work', 'study', 'life', 'health'] as const
export type InkActivity = (typeof INK_ACTIVITY)[number]
export type InkDimension = InkActivity | 'bond'

export const INK_DIMENSIONS: InkDimension[] = [...INK_ACTIVITY, 'bond']

export const INK_META: Record<
  InkDimension,
  { label: string; icon: GameIconName }
> = {
  work: { label: '工作', icon: 'briefcase' },
  study: { label: '学习', icon: 'book' },
  life: { label: '生活', icon: 'home' },
  health: { label: '健康', icon: 'heart' },
  bond: { label: '人情', icon: 'chat' },
}

export const INK_WEEK_COUNT = 8
const BOND_POINTS_PER_INK = 8

export type InkTotals = Record<InkDimension, number>
export type InkWeek = { weekKey: string; totals: Record<InkActivity, number> }

function emptyTotals(): InkTotals {
  return { work: 0, study: 0, life: 0, health: 0, bond: 0 }
}

function emptyActivity(): Record<InkActivity, number> {
  return { work: 0, study: 0, life: 0, health: 0 }
}

function activityOf(category?: TaskCategory): InkActivity | null {
  const id = taskCategory(category).id
  return INK_ACTIVITY.includes(id as InkActivity) ? (id as InkActivity) : null
}

function weightFor(difficulty: Difficulty): number {
  return BLOCK_WEIGHTS[difficulty]
}

function addActivity(
  totals: Record<InkActivity, number>,
  category: TaskCategory | undefined,
  amount: number,
) {
  const dim = activityOf(category)
  if (!dim || amount <= 0) return
  totals[dim] += amount
}

function bondInk(npc: Record<string, NpcProgress>): number {
  return Object.values(npc).reduce((sum, progress) => {
    const points = progress.friendshipPoints + progress.romancePoints
    return sum + Math.floor(points / BOND_POINTS_PER_INK)
  }, 0)
}

function collectActivity(input: {
  tasks: Task[]
  habits: Habit[]
  projects: Project[]
  onMark: (category: TaskCategory | undefined, amount: number, dayKey: string) => void
}) {
  for (const task of input.tasks) {
    if (!task.done || !task.completedAt) continue
    input.onMark(
      task.category,
      weightFor(task.difficulty),
      localDayKey(new Date(task.completedAt)),
    )
  }

  for (const habit of input.habits) {
    for (const entry of habit.entries) {
      const period = habit.mode === 'count' ? habit.countPeriod ?? 'day' : 'day'
      if (habit.mode === 'count' && period !== 'day') {
        if (!entry.completedAt) continue
      } else if (entry.count < habit.targetCount) {
        continue
      }
      input.onMark(habit.category, 1, entry.dayKey)
    }
  }

  for (const project of input.projects) {
    for (const block of project.blocks) {
      if (!block.done || !block.completedAt) continue
      input.onMark(
        project.category,
        weightFor(block.difficulty),
        localDayKey(new Date(block.completedAt)),
      )
    }
  }
}

export function inkPortrait(
  state: Pick<GameState, 'tasks' | 'habits' | 'projects' | 'npc'>,
): InkTotals {
  const totals = emptyTotals()
  collectActivity({
    tasks: state.tasks,
    habits: state.habits,
    projects: state.projects,
    onMark: (category, amount) => addActivity(totals, category, amount),
  })
  totals.bond = bondInk(state.npc)
  return totals
}

export function inkWeeks(
  state: Pick<GameState, 'tasks' | 'habits' | 'projects'>,
  now = new Date(),
  weekCount = INK_WEEK_COUNT,
): InkWeek[] {
  const thisMonday = mondayKey(now)
  const weeks: InkWeek[] = Array.from({ length: weekCount }, (_, index) => ({
    weekKey: addDaysToDayKey(thisMonday, (index - (weekCount - 1)) * 7),
    totals: emptyActivity(),
  }))
  const byKey = new Map(weeks.map((week) => [week.weekKey, week]))

  collectActivity({
    tasks: state.tasks,
    habits: state.habits,
    projects: state.projects,
    onMark: (category, amount, dayKey) => {
      const week = byKey.get(mondayKey(new Date(`${dayKey}T12:00:00`)))
      if (!week) return
      addActivity(week.totals, category, amount)
    },
  })

  return weeks
}

export function inkFill(totals: InkTotals): Record<InkDimension, number> {
  const peak = Math.max(...INK_DIMENSIONS.map((dim) => totals[dim]), 0)
  if (peak <= 0) {
    return { work: 0, study: 0, life: 0, health: 0, bond: 0 }
  }
  return {
    work: totals.work / peak,
    study: totals.study / peak,
    life: totals.life / peak,
    health: totals.health / peak,
    bond: totals.bond / peak,
  }
}

export function weekInkTotal(totals: Record<InkActivity, number>): number {
  return INK_ACTIVITY.reduce((sum, dim) => sum + totals[dim], 0)
}
