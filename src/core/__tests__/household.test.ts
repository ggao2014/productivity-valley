import { describe, expect, it } from 'vitest'
import { buildDailyChorePlan, choreIsDue, configuredHomeRooms, HOME_ROOMS, roomMaintenance } from '../household'

describe('household maintenance', () => {
  it('contains the nine maintained home areas', () => {
    expect(HOME_ROOMS).toHaveLength(9)
    expect(HOME_ROOMS.map((room) => room.id)).not.toContain('basement')
  })

  it('resets daily chores on a new local day', () => {
    expect(choreIsDue('daily', '2026-09-01T18:00:00', new Date('2026-09-01T20:00:00'))).toBe(false)
    expect(choreIsDue('daily', '2026-09-01T18:00:00', new Date('2026-09-02T08:00:00'))).toBe(true)
  })

  it('keeps longer chores complete until their interval passes', () => {
    const completedAt = '2026-09-01T12:00:00Z'
    expect(choreIsDue('weekly', completedAt, new Date('2026-09-07T12:00:00Z'))).toBe(false)
    expect(choreIsDue('weekly', completedAt, new Date('2026-09-08T12:00:00Z'))).toBe(true)
  })

  it('calculates room maintenance from scheduled routines', () => {
    const room = HOME_ROOMS[0]
    const now = new Date('2026-09-02T12:00:00Z')
    const completions = Object.fromEntries(room.chores.map((item) => [item.id, { completedAt: now.toISOString() }]))
    expect(roomMaintenance(room, completions, now)).toBe(100)
    expect(roomMaintenance(room, {}, now)).toBe(0)
  })

  it('plans no more than two periodic routines and keeps them in one room when possible', () => {
    const plan = buildDailyChorePlan({}, new Date('2026-09-02T12:00:00'))
    expect(plan.choreIds).toHaveLength(2)
    const rooms = HOME_ROOMS.filter((room) => room.chores.some((item) => plan.choreIds.includes(item.id)))
    expect(rooms).toHaveLength(1)
    expect(rooms[0].chores.filter((item) => plan.choreIds.includes(item.id)).every((item) => item.frequency !== 'daily')).toBe(true)
  })

  it('applies preferences and places custom chores in their room', () => {
    const rooms = configuredHomeRooms(
      { 'kitchen-reset': { frequency: 'weekly', enabled: false, details: ['新细项'] } },
      [{ id: 'custom-1', roomId: 'kitchen', title: '擦吊灯', frequency: 'monthly', details: [], enabled: true, includeInToday: true }],
    )
    const kitchen = rooms.find((room) => room.id === 'kitchen')!
    expect(kitchen.chores.find((item) => item.id === 'kitchen-reset')).toMatchObject({ frequency: 'weekly', enabled: false, details: ['新细项'] })
    expect(kitchen.chores.find((item) => item.id === 'custom-1')?.title).toBe('擦吊灯')
  })
})
