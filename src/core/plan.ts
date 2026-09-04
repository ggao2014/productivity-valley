import type { Habit, PlanAssignment, PlanSlot, PlanTarget, Project, Task } from './types'
import { localDayKey } from './economy'
import { habitCompletedOn, habitDueOn } from './productivity'

/** Kept for save compatibility and migrating old slot-based order. */
export const PLAN_SLOTS: PlanSlot[] = ['morning', 'afternoon', 'evening', 'anytime']

export const PLAN_SLOT_LABELS: Record<PlanSlot, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
  anytime: '有空再做',
}

export function planTargetKey(target: PlanTarget): string {
  if (target.kind === 'task') return `task:${target.id}`
  if (target.kind === 'habit') return `habit:${target.id}`
  return `block:${target.projectId}:${target.blockId}`
}

export function samePlanTarget(a: PlanTarget, b: PlanTarget): boolean {
  return planTargetKey(a) === planTargetKey(b)
}

export function findPlan(
  plans: PlanAssignment[],
  dayKey: string,
  target: PlanTarget,
): PlanAssignment | undefined {
  return plans.find(
    (plan) => plan.dayKey === dayKey && samePlanTarget(plan.target, target),
  )
}

export function slotForPlan(
  plans: PlanAssignment[],
  dayKey: string,
  target: PlanTarget,
): PlanSlot {
  return findPlan(plans, dayKey, target)?.slot ?? 'anytime'
}

export function upsertPlan(
  plans: PlanAssignment[],
  dayKey: string,
  target: PlanTarget,
  slot: PlanSlot,
): PlanAssignment[] {
  const without = plans.filter(
    (plan) => !(plan.dayKey === dayKey && samePlanTarget(plan.target, target)),
  )
  return [...without, { dayKey, slot, target }]
}

export function addDaysToDayKey(dayKey: string, days: number): string {
  const date = new Date(`${dayKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  return localDayKey(date)
}

export type PlanDayShortcut = 'tomorrow' | 'day-after' | 'later'

export const PLAN_DAY_SHORTCUTS: PlanDayShortcut[] = ['tomorrow', 'day-after', 'later']

export const PLAN_DAY_SHORTCUT_LABELS: Record<PlanDayShortcut, string> = {
  tomorrow: '明天',
  'day-after': '后天',
  later: '以后',
}

const PLAN_DAY_SHORTCUT_OFFSETS: Record<PlanDayShortcut, number> = {
  tomorrow: 1,
  'day-after': 2,
  later: 7,
}

export type PlanPickerValue = 'today' | PlanDayShortcut

export function resolvePlanPicker(
  value: PlanPickerValue,
  todayKey = localDayKey(),
): { slot: PlanSlot; dayKey: string } {
  if (value === 'tomorrow' || value === 'day-after' || value === 'later') {
    return {
      slot: 'anytime',
      dayKey: addDaysToDayKey(todayKey, PLAN_DAY_SHORTCUT_OFFSETS[value]),
    }
  }
  return { slot: 'anytime', dayKey: todayKey }
}

export function planPickerValue(
  plans: PlanAssignment[],
  target: PlanTarget,
  todayKey = localDayKey(),
): PlanPickerValue {
  const todayPlan = findPlan(plans, todayKey, target)
  if (todayPlan) return 'today'

  const future = plans
    .filter(
      (plan) => samePlanTarget(plan.target, target) && plan.dayKey > todayKey,
    )
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey))[0]

  if (!future) return 'today'

  for (const shortcut of PLAN_DAY_SHORTCUTS) {
    if (
      future.dayKey ===
      addDaysToDayKey(todayKey, PLAN_DAY_SHORTCUT_OFFSETS[shortcut])
    ) {
      return shortcut
    }
  }
  return 'later'
}

export function relativePlanDayLabel(
  dayKey: string,
  todayKey = localDayKey(),
): string {
  for (const shortcut of PLAN_DAY_SHORTCUTS) {
    if (
      dayKey === addDaysToDayKey(todayKey, PLAN_DAY_SHORTCUT_OFFSETS[shortcut])
    ) {
      return PLAN_DAY_SHORTCUT_LABELS[shortcut]
    }
  }
  const [, month, day] = dayKey.split('-')
  return `${Number(month)}月${Number(day)}日`
}

export type DeferredItem =
  | {
      kind: 'task'
      id: string
      task: Task
      dayKey: string
      slot: PlanSlot
    }
  | {
      kind: 'block'
      id: string
      project: Project
      blockId: string
      dayKey: string
      slot: PlanSlot
    }

export function buildDeferredItems(input: {
  plans: PlanAssignment[]
  tasks: Task[]
  projects: Project[]
  dayKey?: string
}): DeferredItem[] {
  const todayKey = input.dayKey ?? localDayKey()
  const items: DeferredItem[] = []

  for (const plan of input.plans) {
    if (plan.dayKey <= todayKey) continue
    const target = plan.target

    if (target.kind === 'task') {
      const task = input.tasks.find((entry) => entry.id === target.id)
      if (!task || task.done) continue
      items.push({
        kind: 'task',
        id: task.id,
        task,
        dayKey: plan.dayKey,
        slot: plan.slot,
      })
      continue
    }

    if (target.kind !== 'block') continue
    const project = input.projects.find((entry) => entry.id === target.projectId)
    if (!project || project.status !== 'active') continue
    const block = project.blocks.find((entry) => entry.id === target.blockId)
    if (!block || block.done) continue
    items.push({
      kind: 'block',
      id: `${project.id}:${block.id}`,
      project,
      blockId: block.id,
      dayKey: plan.dayKey,
      slot: plan.slot,
    })
  }

  return items.sort((a, b) =>
    a.dayKey === b.dayKey
      ? a.id.localeCompare(b.id)
      : a.dayKey.localeCompare(b.dayKey),
  )
}

export function removePlansForTarget(
  plans: PlanAssignment[],
  target: PlanTarget,
): PlanAssignment[] {
  return plans.filter((plan) => !samePlanTarget(plan.target, target))
}

/** Move a target onto one day/slot, clearing any other-day plans for it. */
export function movePlan(
  plans: PlanAssignment[],
  target: PlanTarget,
  slot: PlanSlot,
  dayKey: string,
): PlanAssignment[] {
  return upsertPlan(removePlansForTarget(plans, target), dayKey, target, slot)
}

export function removePlansForProject(
  plans: PlanAssignment[],
  projectId: string,
): PlanAssignment[] {
  return plans.filter(
    (plan) =>
      !(plan.target.kind === 'block' && plan.target.projectId === projectId),
  )
}

export function removePlansForBlock(
  plans: PlanAssignment[],
  projectId: string,
  blockId: string,
): PlanAssignment[] {
  return plans.filter(
    (plan) =>
      !(
        plan.target.kind === 'block' &&
        plan.target.projectId === projectId &&
        plan.target.blockId === blockId
      ),
  )
}

export type TimelineItem =
  | {
      kind: 'task'
      id: string
      task: Task
      slot: PlanSlot
      done: boolean
    }
  | {
      kind: 'habit'
      id: string
      habit: Habit
      slot: PlanSlot
      done: boolean
    }
  | {
      kind: 'block'
      id: string
      project: Project
      blockId: string
      slot: PlanSlot
      done: boolean
    }

function taskPlannedElsewhere(
  plans: PlanAssignment[],
  taskId: string,
  dayKey: string,
): boolean {
  return plans.some(
    (plan) =>
      plan.target.kind === 'task' &&
      plan.target.id === taskId &&
      plan.dayKey !== dayKey,
  )
}

function blockPlannedElsewhere(
  plans: PlanAssignment[],
  projectId: string,
  blockId: string,
  dayKey: string,
): boolean {
  return plans.some(
    (plan) =>
      plan.target.kind === 'block' &&
      plan.target.projectId === projectId &&
      plan.target.blockId === blockId &&
      plan.dayKey !== dayKey,
  )
}

export function buildTimelineItems(input: {
  plans: PlanAssignment[]
  tasks: Task[]
  habits: Habit[]
  projects: Project[]
  dayKey?: string
  now?: Date
}): TimelineItem[] {
  const now = input.now ?? new Date()
  const dayKey = input.dayKey ?? localDayKey(now)
  const isToday = dayKey === localDayKey(now)
  const items: TimelineItem[] = []

  for (const task of input.tasks) {
    const doneToday =
      !!task.done &&
      !!task.completedAt &&
      localDayKey(new Date(task.completedAt)) === dayKey
    const todayPlan = findPlan(input.plans, dayKey, { kind: 'task', id: task.id })

    if (task.done) {
      if (!doneToday) continue
      items.push({
        kind: 'task',
        id: task.id,
        task,
        slot: todayPlan?.slot ?? 'anytime',
        done: true,
      })
      continue
    }

    if (taskPlannedElsewhere(input.plans, task.id, dayKey) && !todayPlan) continue

    items.push({
      kind: 'task',
      id: task.id,
      task,
      slot: todayPlan?.slot ?? 'anytime',
      done: false,
    })
  }

  for (const habit of input.habits) {
    if (!isToday) continue
    if (!habitDueOn(habit, now)) continue
    items.push({
      kind: 'habit',
      id: habit.id,
      habit,
      slot: slotForPlan(input.plans, dayKey, { kind: 'habit', id: habit.id }),
      done: habitCompletedOn(habit, dayKey),
    })
  }

  for (const project of input.projects) {
    if (project.status !== 'active') continue
    const nextOpen = project.blocks.find((block) => !block.done)

    for (const block of project.blocks) {
      const doneToday =
        !!block.done &&
        !!block.completedAt &&
        localDayKey(new Date(block.completedAt)) === dayKey
      const todayPlan = findPlan(input.plans, dayKey, {
        kind: 'block',
        projectId: project.id,
        blockId: block.id,
      })
      const elsewhere = blockPlannedElsewhere(
        input.plans,
        project.id,
        block.id,
        dayKey,
      )

      if (doneToday) {
        items.push({
          kind: 'block',
          id: `${project.id}:${block.id}`,
          project,
          blockId: block.id,
          slot: todayPlan?.slot ?? 'anytime',
          done: true,
        })
        continue
      }

      if (block.done) continue
      if (nextOpen?.id !== block.id) continue
      if (elsewhere && !todayPlan) continue

      items.push({
        kind: 'block',
        id: `${project.id}:${block.id}`,
        project,
        blockId: block.id,
        slot: todayPlan?.slot ?? 'anytime',
        done: false,
      })
    }
  }

  return items
}

export function groupBySlot(
  items: TimelineItem[],
): Record<PlanSlot, TimelineItem[]> {
  const groups: Record<PlanSlot, TimelineItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  }
  for (const item of items) groups[item.slot].push(item)
  return groups
}

/** Flat open list: prefer saved day order, else migrate from old slot order. */
export function sortOpenTimelineItems(
  items: TimelineItem[],
  dayOrder?: string[],
): TimelineItem[] {
  const open = items.filter((item) => !item.done)
  if (dayOrder && dayOrder.length > 0) {
    const rank = new Map(dayOrder.map((id, index) => [id, index]))
    return [...open].sort((a, b) => {
      const rankA = rank.get(a.id)
      const rankB = rank.get(b.id)
      if (rankA !== undefined && rankB !== undefined) return rankA - rankB
      if (rankA !== undefined) return -1
      if (rankB !== undefined) return 1
      const slotDiff = PLAN_SLOTS.indexOf(a.slot) - PLAN_SLOTS.indexOf(b.slot)
      if (slotDiff !== 0) return slotDiff
      return a.id.localeCompare(b.id)
    })
  }
  return PLAN_SLOTS.flatMap((slot) => open.filter((item) => item.slot === slot))
}

export function reorderIds(
  ids: string[],
  fromId: string,
  toId: string,
): string[] {
  const from = ids.indexOf(fromId)
  const to = ids.indexOf(toId)
  if (from < 0 || to < 0 || from === to) return ids
  const next = [...ids]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function pruneDayOrders(
  dayOrders: Record<string, string[]>,
  removeIds: string[],
): Record<string, string[]> {
  if (removeIds.length === 0) return dayOrders
  const remove = new Set(removeIds)
  const next: Record<string, string[]> = {}
  for (const [dayKey, ids] of Object.entries(dayOrders)) {
    const filtered = ids.filter((id) => !remove.has(id))
    if (filtered.length > 0) next[dayKey] = filtered
  }
  return next
}
