import { describe, expect, it } from 'vitest'
import {
  eligibleEventIds,
  eventById,
  eventsForNpc,
  illustrationForEvent,
} from '../events'
import { NPC_DEFS } from '../npcs'
import { npcProgress } from './fixtures'

describe('relationship event catalog', () => {
  it('contains three friendship and three romance events per core character', () => {
    const allEventIds: string[] = []
    for (const { id: npcId } of NPC_DEFS) {
      const events = eventsForNpc(npcId)
      allEventIds.push(...events.map((event) => event.id))
      expect(events).toHaveLength(6)
      expect(events.filter((event) => event.track === 'friendship')).toHaveLength(
        3,
      )
      expect(events.filter((event) => event.track === 'romance')).toHaveLength(3)
      expect(new Set(events.map((event) => event.id)).size).toBe(6)
      expect(events.every((event) => event.lines.length >= 2)).toBe(true)
      expect(
        events
          .filter((event) => event.track === 'friendship')
          .map((event) => event.threshold),
      ).toEqual([20, 50, 90])
      expect(
        events
          .filter((event) => event.track === 'romance')
          .map((event) => event.threshold),
      ).toEqual([30, 70, 120])
    }
    expect(new Set(allEventIds).size).toBe(allEventIds.length)
  })

  it('unlocks events from points while keeping romance gated', () => {
    const friendshipOnly = eligibleEventIds(
      'guwan',
      npcProgress({
        friendshipPoints: 90,
        romancePoints: 120,
        romanceUnlocked: false,
      }),
    )
    expect(friendshipOnly).toHaveLength(3)
    expect(friendshipOnly.every((id) => eventById(id)?.track === 'friendship')).toBe(
      true,
    )

    const all = eligibleEventIds(
      'guwan',
      npcProgress({
        friendshipPoints: 90,
        romancePoints: 120,
        romanceUnlocked: true,
      }),
    )
    expect(all).toHaveLength(6)
  })

  it('maps every event to its character and relationship illustration', () => {
    for (const { id: npcId } of NPC_DEFS) {
      for (const event of eventsForNpc(npcId)) {
        const version = npcId === 'taotao' ? 2 : 1
        expect(illustrationForEvent(event)).toBe(
          `art/events/${npcId}-${event.track}-v${version}.webp`,
        )
      }
    }
  })
})
