import { describe, expect, it } from 'vitest'
import {
  assignResident,
  canAddRoom,
  canUpgradeBedroomToCourtyard,
  courtyardCapacityUsed,
  emptyBedCount,
  minimumCourtyardLevel,
  removeResident,
  roomResidentIds,
  roomTypeLimitReached,
} from '../roomRules'
import type { RoomInstance } from '../types'

const living: RoomInstance = { id: 'living', type: 'living', occupantId: null, level: 1 }

describe('courtyard bedroom rules', () => {
  it('provides three independent resident slots at level four', () => {
    const room: RoomInstance = {
      id: 'compound',
      type: 'bedroom',
      level: 4,
      occupantId: 'a',
      wingOccupantIds: [null, null],
    }
    const withLeft = assignResident(room, 'b')!
    const full = assignResident(withLeft, 'c')!
    expect(roomResidentIds(full)).toEqual(['a', 'b', 'c'])
    expect(emptyBedCount([full])).toBe(0)
    expect(roomResidentIds(removeResident(full, 'b'))).toEqual(['a', null, 'c'])
  })

  it('counts the compound as three equivalent courtyard slots', () => {
    const rooms: RoomInstance[] = [
      living,
      { id: 'compound', type: 'bedroom', occupantId: null, wingOccupantIds: [null, null], level: 4 },
      { id: 'kitchen', type: 'kitchen', occupantId: null, level: 1 },
    ]
    expect(courtyardCapacityUsed(rooms)).toBe(4)
    expect(minimumCourtyardLevel(rooms)).toBe(4)
  })

  it('requires the two-entry courtyard, a free compound plot and two spare slots', () => {
    const bedroom: RoomInstance = { id: 'bedroom', type: 'bedroom', occupantId: null, level: 3 }
    expect(canUpgradeBedroomToCourtyard([living, bedroom], 3, bedroom.id)).toBe(false)
    expect(canUpgradeBedroomToCourtyard([living, bedroom], 4, bedroom.id)).toBe(true)
    const existing: RoomInstance = { id: 'existing', type: 'bedroom', occupantId: null, wingOccupantIds: [null, null], level: 4 }
    expect(canUpgradeBedroomToCourtyard([living, bedroom, existing], 4, bedroom.id)).toBe(false)
  })
})

describe('room construction availability', () => {
  it.each([
    [1, 2],
    [2, 4],
    [3, 8],
    [4, 13],
  ] as const)('matches level %i construction to its %i visible plots', (level, capacity) => {
    const oneSpaceLeft: RoomInstance[] = [
      living,
      ...Array.from({ length: capacity - 1 }, (_, index) => ({
        id: `bed-${index}`,
        type: 'bedroom' as const,
        occupantId: null,
        level: 1 as const,
      })),
    ]
    expect(canAddRoom(oneSpaceLeft, level, 'bedroom')).toBe(true)

    const full: RoomInstance[] = [
      ...oneSpaceLeft,
      { id: 'last-bed', type: 'bedroom', occupantId: null, level: 1 },
    ]
    expect(courtyardCapacityUsed(full)).toBe(capacity)
    expect(canAddRoom(full, level, 'bedroom')).toBe(false)
    expect(canAddRoom(full, level, 'kitchen')).toBe(false)
  })

  it('allows repeat bedrooms but only one of each utility room', () => {
    const rooms: RoomInstance[] = [
      living,
      { id: 'bedroom', type: 'bedroom', occupantId: null, level: 1 },
      { id: 'kitchen', type: 'kitchen', occupantId: null, level: 1 },
    ]
    expect(roomTypeLimitReached(rooms, 'bedroom')).toBe(false)
    expect(canAddRoom(rooms, 3, 'bedroom')).toBe(true)
    expect(roomTypeLimitReached(rooms, 'kitchen')).toBe(true)
    expect(canAddRoom(rooms, 3, 'kitchen')).toBe(false)
  })

  it('keeps the study and storehouse outside construction capacity', () => {
    const rooms: RoomInstance[] = [
      living,
      { id: 'study', type: 'study', occupantId: null, level: 2 },
      { id: 'storage', type: 'storage', occupantId: null, level: 3 },
      { id: 'bedroom', type: 'bedroom', occupantId: null, level: 1 },
    ]
    expect(courtyardCapacityUsed(rooms)).toBe(1)
    expect(canAddRoom(rooms, 1, 'study')).toBe(false)
    expect(canAddRoom(rooms, 1, 'storage')).toBe(false)
  })

  it('counts a courtyard bedroom as three plots at the highest level', () => {
    const compound: RoomInstance = {
      id: 'compound',
      type: 'bedroom',
      occupantId: null,
      wingOccupantIds: [null, null],
      level: 4,
    }
    const nineRooms: RoomInstance[] = [
      living,
      compound,
      ...Array.from({ length: 9 }, (_, index) => ({
        id: `room-${index}`,
        type: 'bedroom' as const,
        occupantId: null,
        level: 1 as const,
      })),
    ]
    expect(courtyardCapacityUsed(nineRooms)).toBe(12)
    expect(canAddRoom(nineRooms, 4, 'bedroom')).toBe(true)
    expect(canAddRoom([
      ...nineRooms,
      { id: 'room-10', type: 'bedroom', occupantId: null, level: 1 },
    ], 4, 'bedroom')).toBe(false)
  })
})
