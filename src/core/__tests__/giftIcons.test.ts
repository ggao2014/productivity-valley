import { describe, expect, it } from 'vitest'
import { GIFT_ICON_NAMES } from '../../assets/icons/giftIconNames'
import { GIFT_DEFS } from '../constants'

describe('gift icon catalog', () => {
  it('matches all twelve gift definitions one-to-one', () => {
    expect(GIFT_DEFS).toHaveLength(12)
    expect([...GIFT_ICON_NAMES].sort()).toEqual(
      GIFT_DEFS.map((gift) => gift.id).sort(),
    )
  })
})
