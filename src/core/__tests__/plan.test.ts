import { describe, expect, it } from 'vitest'
import {
  addDaysToDayKey,
  buildDeferredItems,
  buildTimelineItems,
  groupBySlot,
  movePlan,
  planPickerValue,
  relativePlanDayLabel,
  removePlansForTarget,
  resolvePlanPicker,
  upsertPlan,
} from '../plan'
import type { Habit, PlanAssignment, Project, Task } from '../types'

const today = '2026-08-11'

function task(partial: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    difficulty: 'small',
    done: false,
    createdAt: `${today}T08:00:00.000Z`,
    category: 'errand',
    ...partial,
  }
}

function habit(partial: Partial<Habit> & Pick<Habit, 'id' | 'title'>): Habit {
  return {
    mode: 'check',
    targetCount: 1,
    schedule: { type: 'daily' },
    active: true,
    createdAt: `${today}T08:00:00.000Z`,
    entries: [],
    weeklyRewardKeys: [],
    category: 'health',
    ...partial,
  }
}

function project(partial: Partial<Project> & Pick<Project, 'id' | 'title'>): Project {
  return {
    size: 'small',
    status: 'active',
    createdAt: `${today}T08:00:00.000Z`,
    blocks: [
      {
        id: 'b1',
        title: '第一步',
        difficulty: 'small',
        done: false,
        createdAt: `${today}T08:00:00.000Z`,
      },
    ],
    awardedMilestones: [],
    category: 'work',
    ...partial,
  }
}

describe('day plan helpers', () => {
  it('upserts and replaces a slot for the same target/day', () => {
    let plans: PlanAssignment[] = []
    plans = upsertPlan(plans, today, { kind: 'task', id: 't1' }, 'morning')
    plans = upsertPlan(plans, today, { kind: 'task', id: 't1' }, 'evening')
    expect(plans).toEqual([
      { dayKey: today, slot: 'evening', target: { kind: 'task', id: 't1' } },
    ])
  })

  it('moves a plan to another day and clears the old assignment', () => {
    let plans = upsertPlan([], today, { kind: 'task', id: 't1' }, 'morning')
    plans = movePlan(
      plans,
      { kind: 'task', id: 't1' },
      'anytime',
      addDaysToDayKey(today, 1),
    )
    expect(plans).toEqual([
      {
        dayKey: '2026-08-12',
        slot: 'anytime',
        target: { kind: 'task', id: 't1' },
      },
    ])
  })

  it('resolves picker shortcuts into day keys', () => {
    expect(resolvePlanPicker('morning', today)).toEqual({
      slot: 'morning',
      dayKey: today,
    })
    expect(resolvePlanPicker('tomorrow', today)).toEqual({
      slot: 'anytime',
      dayKey: '2026-08-12',
    })
    expect(resolvePlanPicker('later', today)).toEqual({
      slot: 'anytime',
      dayKey: '2026-08-18',
    })
    expect(relativePlanDayLabel('2026-08-12', today)).toBe('明天')
    expect(
      planPickerValue(
        [
          {
            dayKey: '2026-08-13',
            slot: 'anytime',
            target: { kind: 'task', id: 't1' },
          },
        ],
        { kind: 'task', id: 't1' },
        today,
      ),
    ).toBe('day-after')
  })

  it('lists deferred tasks and blocks for later days', () => {
    const items = buildDeferredItems({
      plans: [
        {
          dayKey: '2026-08-12',
          slot: 'anytime',
          target: { kind: 'task', id: 't1' },
        },
        {
          dayKey: '2026-08-18',
          slot: 'anytime',
          target: { kind: 'block', projectId: 'p1', blockId: 'b1' },
        },
      ],
      tasks: [task({ id: 't1', title: '明天的事' })],
      projects: [project({ id: 'p1', title: '作品集' })],
      dayKey: today,
    })
    expect(items.map((item) => item.id)).toEqual(['t1', 'p1:b1'])
  })

  it('removes all plans for a deleted target', () => {
    const plans = removePlansForTarget(
      [
        { dayKey: today, slot: 'morning', target: { kind: 'habit', id: 'h1' } },
        { dayKey: '2026-08-12', slot: 'afternoon', target: { kind: 'habit', id: 'h1' } },
        { dayKey: today, slot: 'evening', target: { kind: 'task', id: 't1' } },
      ],
      { kind: 'habit', id: 'h1' },
    )
    expect(plans).toEqual([
      { dayKey: today, slot: 'evening', target: { kind: 'task', id: 't1' } },
    ])
  })

  it('groups today items into timeline slots', () => {
    const plans: PlanAssignment[] = [
      { dayKey: today, slot: 'morning', target: { kind: 'task', id: 't1' } },
      { dayKey: today, slot: 'afternoon', target: { kind: 'habit', id: 'h1' } },
    ]
    const items = buildTimelineItems({
      plans,
      tasks: [task({ id: 't1', title: '写信' }), task({ id: 't2', title: '买菜' })],
      habits: [habit({ id: 'h1', title: '散步' })],
      projects: [project({ id: 'p1', title: '作品集' })],
      dayKey: today,
      now: new Date(`${today}T10:00:00`),
    })
    const grouped = groupBySlot(items)
    expect(grouped.morning.map((item) => item.id)).toEqual(['t1'])
    expect(grouped.afternoon.map((item) => item.id)).toEqual(['h1'])
    expect(grouped.anytime.map((item) => item.id).sort()).toEqual(['p1:b1', 't2'])
  })

  it('hides open tasks planned for another day', () => {
    const items = buildTimelineItems({
      plans: [
        {
          dayKey: '2026-08-12',
          slot: 'morning',
          target: { kind: 'task', id: 't1' },
        },
      ],
      tasks: [task({ id: 't1', title: '明天的事' })],
      habits: [],
      projects: [],
      dayKey: today,
      now: new Date(`${today}T10:00:00`),
    })
    expect(items).toEqual([])
  })
})
