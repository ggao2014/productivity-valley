import { describe, expect, it } from 'vitest'
import {
  CORE_EXPRESSION_PORTRAITS,
  portraitForNpc,
  spriteForNpc,
} from '../visualAssets'
import type { DialogueTone } from '../types'
import { DECORATION_DEFS } from '../constants'
import { NPC_DEFS } from '../npcs'
import {
  COURTYARD_LANDSCAPE_DEFS,
  courtyardLandscapePlacement,
} from '../courtyardLandscapes'

const TONES: DialogueTone[] = [
  'neutral',
  'warm',
  'worried',
  'annoyed',
  'shy',
]

describe('character expression assets', () => {
  it('provides all five tones for every character', () => {
    for (const { id: npcId } of NPC_DEFS) {
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

  it('provides idle, walking-away and move-in sprites for every character', () => {
    for (const { id: npcId } of NPC_DEFS) {
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

describe('courtyard landscape catalog', () => {
  it('ships three versioned illustrated main scenes plus the open yard', () => {
    expect(COURTYARD_LANDSCAPE_DEFS.map((item) => item.id)).toEqual([
      'open',
      'old_tree',
      'kitchen_garden',
      'pond',
    ])
    for (const item of COURTYARD_LANDSCAPE_DEFS.slice(1)) {
      expect(item.asset).toMatch(/-v1\.webp$/)
      expect(item.cost).toBeGreaterThan(0)
      expect(courtyardLandscapePlacement(item.id, item.minCourtyardLevel)).not.toBeNull()
    }
  })
})
