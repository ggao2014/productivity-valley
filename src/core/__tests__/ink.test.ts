import { describe, expect, it } from 'vitest'
import { inkFill, inkPortrait, inkWeeks } from '../ink'
import { gameState, npcProgress } from './fixtures'
import type { Habit, Project, Task } from '../types'

const day = '2026-08-11'

function task(partial: Partial<Task> & Pick<Task, 'id' | 'title' | 'category'>): Task {
  return {
    difficulty: 'small',
    done: true,
    createdAt: `${day}T08:00:00.000Z`,
    completedAt: `${day}T10:00:00.000Z`,
    ...partial,
  }
}

function habit(partial: Partial<Habit> & Pick<Habit, 'id' | 'title' | 'category'>): Habit {
  return {
    mode: 'check',
    targetCount: 1,
    schedule: { type: 'daily' },
    active: true,
    createdAt: `${day}T08:00:00.000Z`,
    entries: [{ dayKey: day, count: 1, completedAt: `${day}T10:00:00.000Z` }],
    weeklyRewardKeys: [],
    ...partial,
  }
}

function project(partial: Partial<Project> & Pick<Project, 'id' | 'title' | 'category'>): Project {
  return {
    size: 'small',
    status: 'active',
    createdAt: `${day}T08:00:00.000Z`,
    blocks: [
      {
        id: 'b1',
        title: '第一步',
        difficulty: 'medium',
        done: true,
        createdAt: `${day}T08:00:00.000Z`,
        completedAt: `${day}T11:00:00.000Z`,
      },
    ],
    awardedMilestones: [],
    ...partial,
  }
}

describe('ink portrait', () => {
  it('scores tagged work by size and ignores errands', () => {
    const state = gameState({
      tasks: [
        task({ id: 't1', title: '开会', category: 'work', difficulty: 'large' }),
        task({ id: 't2', title: '买菜', category: 'errand' }),
        task({ id: 't3', title: '未完成', category: 'study', done: false, completedAt: undefined }),
      ],
      habits: [habit({ id: 'h1', title: '散步', category: 'health' })],
      projects: [project({ id: 'p1', title: '作品集', category: 'study' })],
    })
    expect(inkPortrait(state)).toEqual({
      work: 3,
      study: 2,
      life: 0,
      health: 1,
      bond: 0,
    })
  })

  it('counts bond ink from friendship and romance, not errands', () => {
    const state = gameState({
      npc: {
        shendu: npcProgress({ friendshipPoints: 20, romancePoints: 4 }),
        qinghe: npcProgress({ friendshipPoints: 7 }),
      },
    })
    expect(inkPortrait(state).bond).toBe(3)
  })

  it('builds a relative fill without renaming dimensions', () => {
    const fill = inkFill({ work: 8, study: 4, life: 0, health: 2, bond: 8 })
    expect(fill.work).toBe(1)
    expect(fill.bond).toBe(1)
    expect(fill.study).toBe(0.5)
    expect(fill.health).toBe(0.25)
    expect(fill.life).toBe(0)
  })

  it('groups recent weeks by activity color and drops older ink', () => {
    const now = new Date('2026-08-17T12:00:00')
    const state = gameState({
      tasks: [
        task({
          id: 'old',
          title: '很久以前',
          category: 'work',
          completedAt: '2026-06-01T10:00:00.000Z',
        }),
        task({
          id: 'recent',
          title: '这周',
          category: 'life',
          difficulty: 'medium',
          completedAt: '2026-08-17T10:00:00.000Z',
        }),
        task({
          id: 'last',
          title: '上周',
          category: 'health',
          completedAt: '2026-08-10T10:00:00.000Z',
        }),
      ],
    })
    const weeks = inkWeeks(state, now, 8)
    expect(weeks).toHaveLength(8)
    expect(weeks[7]?.weekKey).toBe('2026-08-17')
    expect(weeks[7]?.totals).toEqual({ work: 0, study: 0, life: 2, health: 0 })
    expect(weeks[6]?.weekKey).toBe('2026-08-10')
    expect(weeks[6]?.totals.health).toBe(1)
    expect(weeks.every((week) => week.totals.work === 0)).toBe(true)
  })
})
