import { describe, expect, it } from 'vitest'
import {
  eligibleEventIds,
  eventById,
  eventsForNpc,
  illustrationForEvent,
} from '../events'
import { npcProgress } from './fixtures'

describe('relationship event catalog', () => {
  it('contains three friendship and three romance events per core character', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      const events = eventsForNpc(npcId)
      expect(events).toHaveLength(6)
      expect(events.filter((event) => event.track === 'friendship')).toHaveLength(
        3,
      )
      expect(events.filter((event) => event.track === 'romance')).toHaveLength(3)
    }
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

  it('maps every core event to its character and relationship illustration', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      for (const event of eventsForNpc(npcId)) {
        expect(illustrationForEvent(event)).toBe(
          `art/events/${npcId}-${event.track}-v1.webp`,
        )
      }
    }
  })
})
