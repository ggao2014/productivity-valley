import { describe, expect, it } from 'vitest'
import {
  activeDayStreak,
  canInvite,
  dailyCostPerPerson,
  emptyBeds,
  friendshipStage,
  romanceStage,
  todayTaskProgress,
  totalDailyMaintenance,
} from '../economy'
import { gameState, npcProgress } from './fixtures'

describe('relationship stages', () => {
  it('changes friendship stage exactly at each threshold', () => {
    expect([19, 20, 49, 50, 89, 90].map(friendshipStage)).toEqual([
      0, 1, 1, 2, 2, 3,
    ])
  })

  it('keeps romance hidden until unlocked and reserves stage 4 for cohabiting', () => {
    expect(romanceStage(200, false, true)).toBe(0)
    expect(romanceStage(120, true, false)).toBe(3)
    expect(romanceStage(200, true, false)).toBe(3)
    expect(romanceStage(200, true, true)).toBe(4)
  })
})

describe('rooms and maintenance', () => {
  it('counts only unoccupied rooms with beds', () => {
    expect(
      emptyBeds([
        { id: 'a', type: 'living', occupantId: null },
        { id: 'b', type: 'bedroom', occupantId: null },
        { id: 'c', type: 'guest', occupantId: 'shendu' },
      ]),
    ).toBe(1)
  })

  it('applies kitchen and storage discounts per resident', () => {
    const rooms = [
      { id: 'a', type: 'living', occupantId: null },
      { id: 'b', type: 'kitchen', occupantId: null },
      { id: 'c', type: 'storage', occupantId: null },
    ] as const
    expect(dailyCostPerPerson([...rooms])).toBe(10.4)

    const state = gameState({
      rooms: [...rooms],
      npc: {
        shendu: npcProgress({ livingAtHome: true }),
        guwan: npcProgress({ livingAtHome: true }),
      },
    })
    expect(totalDailyMaintenance(state)).toBe(20.8)
  })
})

describe('inviting a partner', () => {
  it('requires romance stage 3, an empty bed, and the home fee', () => {
    const ready = gameState({
      coins: 20,
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'bed', type: 'bedroom', occupantId: null },
      ],
      npc: {
        shendu: npcProgress({
          romanceUnlocked: true,
          romancePoints: 120,
        }),
      },
    })
    expect(canInvite(ready, 'shendu')).toBe(true)
    expect(canInvite({ ...ready, coins: 19 }, 'shendu')).toBe(false)
    expect(
      canInvite(
        {
          ...ready,
          rooms: ready.rooms.map((room) => ({
            ...room,
            occupantId: room.type === 'bedroom' ? 'someone' : null,
          })),
        },
        'shendu',
      ),
    ).toBe(false)
  })
})

describe('task activity summaries', () => {
  const completed = (day: string, coins: number, bond: number) => ({
    id: day,
    title: day,
    difficulty: 'small' as const,
    done: true,
    createdAt: `${day}T08:00:00`,
    completedAt: `${day}T12:00:00`,
    awardedCoins: coins,
    awardedBond: bond,
  })

  it('totals recorded rewards for the selected local day', () => {
    expect(
      todayTaskProgress(
        [completed('2026-07-30', 10, 1), completed('2026-07-29', 25, 2)],
        '2026-07-30',
      ),
    ).toEqual({ completed: 1, coins: 10, bond: 1 })
  })

  it('counts consecutive active days, including a streak ending yesterday', () => {
    const tasks = [
      completed('2026-07-29', 10, 1),
      completed('2026-07-28', 10, 1),
      completed('2026-07-27', 10, 1),
    ]
    expect(activeDayStreak(tasks, new Date(2026, 6, 30, 12))).toBe(3)
  })
})
