import { describe, expect, it } from 'vitest'
import { clampInt, parseOptionalInt } from '../numberInput'

describe('number input helpers', () => {
  it('allows empty drafts while typing', () => {
    expect(parseOptionalInt('')).toBeNull()
    expect(parseOptionalInt('   ')).toBeNull()
    expect(parseOptionalInt('2')).toBe(2)
    expect(parseOptionalInt('12')).toBe(12)
  })

  it('clamps only when asked, so weekly max no longer traps mid-edit', () => {
    expect(clampInt(12, 1, 7)).toBe(7)
    expect(clampInt(0, 1, 7)).toBe(1)
    expect(clampInt(3, 1, 7)).toBe(3)
    expect(clampInt(Number.NaN, 1)).toBe(1)
  })
})
