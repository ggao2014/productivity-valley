import { describe, expect, it } from 'vitest'
import {
  earnedMilestones,
  giftCapacity,
  gentleWeeklySummary,
  inventoryCount,
  valleyGrowthPoints,
  valleyStage,
  weeklyProgress,
} from '../growth'
import { gameState, npcProgress } from './fixtures'

const completed = (id: string, day = '2026-07-30') => ({
  id,
  title: id,
  difficulty: 'small' as const,
  done: true,
  createdAt: `${day}T08:00:00`,
  completedAt: `${day}T12:00:00`,
})

describe('valley growth', () => {
  it('combines durable accomplishments into stages and milestones', () => {
    const state = gameState({
      tasks: Array.from({ length: 10 }, (_, index) => completed(`t${index}`)),
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'study', type: 'study', occupantId: null },
        { id: 'bed', type: 'bedroom', occupantId: 'shendu' },
      ],
      npc: {
        shendu: npcProgress({
          friendshipPoints: 60,
          livingAtHome: true,
        }),
      },
    })
    expect(valleyGrowthPoints(state)).toBe(29)
    expect(valleyStage(state)).toBe(2)
    expect(earnedMilestones(state)).toEqual([
      'first_task',
      'tasks_10',
      'first_room',
      'first_friend',
      'first_partner',
    ])
  })

  it('reserves the final home stage for a cohabiting partner', () => {
    const state = gameState({
      tasks: Array.from({ length: 40 }, (_, index) => completed(`t${index}`)),
    })
    expect(valleyStage(state)).toBe(2)
  })
})

describe('gentle long-term systems', () => {
  it('counts weekly tasks and active days without requiring a streak', () => {
    const tasks = [
      completed('a', '2026-07-27'),
      completed('b', '2026-07-27'),
      completed('c', '2026-07-29'),
    ]
    expect(weeklyProgress(tasks, new Date(2026, 6, 30, 12))).toEqual({
      completed: 3,
      activeDays: 2,
      taskGoal: 5,
      dayGoal: 3,
    })
  })

  it('describes an empty previous week without blame or lost progress', () => {
    expect(
      gentleWeeklySummary([], new Date(2026, 6, 30, 12)),
    ).toContain('今天回来就算新的开始')
  })

  it('gives every storage room eight additional gift slots', () => {
    const state = gameState({
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'store-a', type: 'storage', occupantId: null },
        { id: 'store-b', type: 'storage', occupantId: null },
      ],
      inventory: [
        { id: 'tea_cake', qty: 3 },
        { id: 'maltose', qty: 2 },
      ],
    })
    expect(giftCapacity(state)).toBe(24)
    expect(inventoryCount(state)).toBe(5)
  })
})
