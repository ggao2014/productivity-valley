import { describe, expect, it } from 'vitest'
import { courtyardAccents, decorationSpots } from '../decorationLayout'

describe('courtyard decoration layouts', () => {
  it.each([1, 2, 3, 4] as const)('keeps every level %i spot inside the courtyard safe area', (level) => {
    const spots = decorationSpots(level)
    expect(spots).toHaveLength(12)
    expect(new Set(spots.map((spot) => `${spot.x}:${spot.y}`)).size).toBe(12)
    for (const spot of spots) {
      expect(spot.x).toBeGreaterThanOrEqual(28)
      expect(spot.x).toBeLessThanOrEqual(72)
      expect(spot.y).toBeGreaterThanOrEqual(53)
      expect(spot.y).toBeLessThanOrEqual(73)
      expect(spot.width).toBeLessThanOrEqual(13)
      expect(spot.zone).toBeTruthy()
      expect(spot.layer).toBeGreaterThanOrEqual(2)
    }
  })

  it('moves social objects toward the active landscape', () => {
    const pond = decorationSpots(3, 'pond')
    const tree = decorationSpots(3, 'old_tree')
    expect(pond.find((spot) => spot.zone === 'waterside')).toBeTruthy()
    expect(tree.find((spot) => spot.x === 65 && spot.y === 66)).toBeTruthy()
  })

  it('adds low ground accents only for matching placed objects', () => {
    expect(courtyardAccents(3, [], 'open')).toEqual([])
    expect(courtyardAccents(3, ['water_jar'], 'open')).toEqual([
      expect.objectContaining({ id: 'damp-stones' }),
    ])
  })
})
