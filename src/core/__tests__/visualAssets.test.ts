import { describe, expect, it } from 'vitest'
import {
  CORE_EXPRESSION_PORTRAITS,
  portraitForNpc,
  spriteForNpc,
} from '../visualAssets'
import type { DialogueTone } from '../types'
import { DECORATION_DEFS } from '../constants'

const TONES: DialogueTone[] = [
  'neutral',
  'warm',
  'worried',
  'annoyed',
  'shy',
]

describe('core character expression assets', () => {
  it('provides all five tones for every core character', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      expect(Object.keys(CORE_EXPRESSION_PORTRAITS[npcId] ?? {}).sort()).toEqual(
        [...TONES].sort(),
      )
      for (const tone of TONES) {
        expect(portraitForNpc(npcId, tone)).toBe(
          `art/characters/expressions/${npcId}-${tone}-v1.webp`,
        )
      }
    }
  })

  it('falls back to the standard portrait outside dialogue', () => {
    expect(portraitForNpc('shendu')).toBe(
      'art/characters/portraits/shendu-portrait-v1.webp',
    )
    expect(portraitForNpc('not-core')).toBeUndefined()
  })

  it('provides idle, walking-away and move-in sprites for every core character', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      expect(spriteForNpc(npcId)).toBe(
        `art/characters/sprites/${npcId}-sprite-v1.webp`,
      )
      expect(spriteForNpc(npcId, 'walkAway')).toBe(
        `art/characters/states/${npcId}-walk-away-v1.webp`,
      )
      expect(spriteForNpc(npcId, 'moveIn')).toBe(
        `art/characters/states/${npcId}-move-in-v1.webp`,
      )
    }
  })
})

describe('phase 3 decoration catalog', () => {
  it('ships twelve unique decorations with versioned WebP assets', () => {
    expect(DECORATION_DEFS).toHaveLength(12)
    expect(new Set(DECORATION_DEFS.map((item) => item.id)).size).toBe(12)
    for (const item of DECORATION_DEFS) {
      expect(item.asset).toMatch(/-v1\.webp$/)
      expect(item.cost).toBeGreaterThan(0)
      expect(item.stage).toBeGreaterThanOrEqual(1)
      expect(item.stage).toBeLessThanOrEqual(3)
    }
  })
})
