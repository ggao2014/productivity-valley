import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../gameStore'
import {
  PROJECT_REWARDS,
  crossedMilestones,
  habitDueOn,
  habitScheduleLabel,
  habitSummaryLabel,
  habitWeeklyProgress,
  nextBlockReward,
  projectProgress,
  nextOpenBlock,
} from '../productivity'
import type { Habit, Project } from '../types'
import { gameState, memoryStorage } from './fixtures'

const now = new Date(2026, 6, 27, 10)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.stubGlobal('localStorage', memoryStorage())
  useGameStore.setState(gameState({ lastDailyKey: '2026-07-26' }))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('habit schedules and rewards', () => {
  it('supports daily, weekday, selected-day and weekly schedules', () => {
    const base: Habit = {
      id: 'h',
      title: 'habit',
      mode: 'check',
      targetCount: 1,
      schedule: { type: 'daily' },
      active: true,
      createdAt: now.toISOString(),
      entries: [],
      weeklyRewardKeys: [],
    }
    expect(habitDueOn(base, now)).toBe(true)
    expect(habitDueOn({ ...base, schedule: { type: 'weekdays' } }, now)).toBe(true)
    expect(habitDueOn({ ...base, schedule: { type: 'selected', days: [2] } }, now)).toBe(false)
    const weekly = { ...base, schedule: { type: 'weekly', weeklyTarget: 2 } as const }
    expect(habitDueOn(weekly, now)).toBe(true)
    expect(habitWeeklyProgress(weekly, now)).toEqual({ completed: 0, target: 2 })
  })

  it('labels schedule as days and mode as daily counts without mixing 次', () => {
    expect(habitScheduleLabel({ type: 'weekly', weeklyTarget: 3 })).toBe('每周 3 天')
    expect(habitScheduleLabel({ type: 'selected', days: [1, 3, 0] })).toBe('周一、三、日')
    expect(
      habitSummaryLabel({
        mode: 'count',
        targetCount: 5,
        schedule: { type: 'weekly', weeklyTarget: 3 },
      }),
    ).toBe('每周 3 天 · 每天 5 次')
    expect(
      habitSummaryLabel({
        mode: 'check',
        targetCount: 1,
        schedule: { type: 'daily' },
      }),
    ).toBe('每天 · 打卡')
  })

  it('locks the first five reward-eligible habits and pays daily plus weekly reward once', () => {
    for (let index = 0; index < 6; index += 1) {
      useGameStore.getState().addHabit(`habit-${index}`, 'check', 1, {
        type: 'weekly',
        weeklyTarget: 1,
      })
    }
    useGameStore.getState().runDailyIfNeeded()
    const ids = useGameStore.getState().habits.map((habit) => habit.id)
    expect(useGameStore.getState().habitRewardSnapshots['2026-07-27']).toEqual(ids.slice(0, 5))

    const coinsBefore = useGameStore.getState().coins
    useGameStore.getState().adjustHabit(ids[0], 1)
    expect(useGameStore.getState().coins - coinsBefore).toBe(28)
    useGameStore.getState().adjustHabit(ids[0], -1)
    useGameStore.getState().adjustHabit(ids[0], 1)
    expect(useGameStore.getState().coins - coinsBefore).toBe(28)

    useGameStore.getState().adjustHabit(ids[5], 1)
    expect(useGameStore.getState().habits[5].entries[0].awardedCoins).toBeUndefined()
  })
})

describe('project budgets', () => {
  it('distributes the remaining block pool by weight and returns the final remainder', () => {
    const project: Project = {
      id: 'p',
      title: 'project',
      size: 'small',
      status: 'active',
      createdAt: now.toISOString(),
      awardedMilestones: [],
      blocks: [
        { id: 'a', title: 'a', difficulty: 'small', done: false, createdAt: now.toISOString() },
        { id: 'b', title: 'b', difficulty: 'large', done: false, createdAt: now.toISOString() },
      ],
    }
    expect(nextBlockReward(project, 'a').coins).toBe(21)
    const after = {
      ...project,
      blocks: [
        { ...project.blocks[0], done: true, awardedCoins: 21, awardedBond: 0 },
        project.blocks[1],
      ],
    }
    expect(nextBlockReward(after, 'b').coins).toBe(63)
    expect(crossedMilestones(20, 76)).toEqual([25, 50, 75])
    expect(projectProgress(after).percent).toBe(25)
  })

  it('pays exactly the configured small-project coin budget across all blocks and milestones', () => {
    useGameStore.getState().addProject('ship feature', 'small')
    const projectId = useGameStore.getState().projects[0].id
    useGameStore.getState().addProjectBlock(projectId, 'design', 'small')
    useGameStore.getState().addProjectBlock(projectId, 'build', 'small')
    useGameStore.getState().startProject(projectId)
    const blockIds = useGameStore.getState().projects[0].blocks.map((block) => block.id)
    const coinsBefore = useGameStore.getState().coins
    blockIds.forEach((blockId) => useGameStore.getState().completeProjectBlock(projectId, blockId))
    const state = useGameStore.getState()
    expect(state.coins - coinsBefore).toBe(PROJECT_REWARDS.small.coins)
    expect(state.projects[0].status).toBe('completed')
    expect(state.projects[0].awardedMilestones).toEqual([25, 50, 75, 100])
  })

  it('starts only after the size minimum and completes blocks in order', () => {
    const id = useGameStore.getState().addProject('ship feature', 'small')
    expect(id).toBeTruthy()
    useGameStore.getState().startProject(id!)
    expect(useGameStore.getState().toast).toBe('至少 2 步')
    expect(useGameStore.getState().projects[0].status).toBe('draft')

    useGameStore.getState().addProjectBlock(id!, 'design', 'small')
    useGameStore.getState().addProjectBlock(id!, 'build', 'small')
    useGameStore.getState().startProject(id!)
    const [first, second] = useGameStore.getState().projects[0].blocks
    useGameStore.getState().completeProjectBlock(id!, second.id)
    expect(useGameStore.getState().toast).toBe('先做上一步')
    expect(useGameStore.getState().projects[0].blocks[1].done).toBe(false)

    useGameStore.getState().completeProjectBlock(id!, first.id)
    expect(useGameStore.getState().projects[0].blocks[0].done).toBe(true)
    expect(nextOpenBlock(useGameStore.getState().projects[0])?.id).toBe(second.id)
  })
})
