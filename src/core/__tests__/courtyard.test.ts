import { describe, expect, it } from 'vitest'
import { courtyardLayout } from '../courtyard'

describe('courtyard layouts', () => {
  it('maps the four estate levels to distinct templates', () => {
    expect(courtyardLayout(1).tier).toBe('small')
    expect(courtyardLayout(2).tier).toBe('three-sided')
    expect(courtyardLayout(3).tier).toBe('four-sided')
    expect(courtyardLayout(4).tier).toBe('two-entry')
  })

  it('provides the expected standard slot capacity', () => {
    expect(courtyardLayout(1).slots).toHaveLength(2)
    expect(courtyardLayout(2).slots).toHaveLength(4)
    expect(courtyardLayout(3).slots).toHaveLength(8)
    expect(courtyardLayout(4).slots).toHaveLength(13)
  })

  it('reserves three rear slots for the compound bedroom', () => {
    const layout = courtyardLayout(4, true)
    expect(layout.slots).toHaveLength(10)
    expect(layout.compoundSlot).toEqual({ x: 50, bottom: 60, width: 34, layer: 1 })
  })

  it('keeps the front gate and its central path clear', () => {
    for (const compound of [false, true]) {
      const layout = courtyardLayout(4, compound)
      const blocksGate = layout.slots.some(
        (slot) => slot.role === 'front' && slot.x > 40 && slot.x < 60,
      )
      expect(blocksGate).toBe(false)
    }
  })

  it('keeps the outer rows separated while following the walled foundation', () => {
    const slots = courtyardLayout(4, true).slots
    const byId = Object.fromEntries(slots.map((slot) => [slot.id, slot]))

    for (const [leftId, rightId] of [['s5', 's6'], ['s7', 's8'], ['s9', 's10']]) {
      expect(byId[leftId].bottom).toBe(byId[rightId].bottom)
    }

    expect(byId.s6.bottom - byId.s8.bottom).toBeGreaterThanOrEqual(11)
    expect(byId.s8.bottom - byId.s10.bottom).toBeGreaterThanOrEqual(11)
    expect(byId.s6.x).toBeLessThanOrEqual(73)
    expect(byId.s8.x).toBeLessThanOrEqual(75)
    expect(byId.s10.x).toBeLessThanOrEqual(76)
    expect(byId.s10.bottom).toBeGreaterThanOrEqual(25)
  })

  it('keeps every slot inside the courtyard scene', () => {
    for (const level of [1, 2, 3, 4] as const) {
      for (const compound of [false, true]) {
        const layout = courtyardLayout(level, compound)
        expect(layout.slots.every((slot) => slot.bottom >= 12 && slot.bottom <= 75)).toBe(true)
        expect(layout.slots.every((slot) => slot.x - slot.width / 2 >= 10)).toBe(true)
        expect(layout.slots.every((slot) => slot.x + slot.width / 2 <= 90)).toBe(true)
      }
    }
  })
})
