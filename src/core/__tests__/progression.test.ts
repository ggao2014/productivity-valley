import { describe, expect, it } from 'vitest'
import {
  interactionBlockReason,
  inviteRequirements,
  romanceBlockReason,
} from '../progression'
import { gameState, npcProgress } from './fixtures'

describe('progression guidance', () => {
  it('reports compact friendship progress for locked actions', () => {
    const state = gameState({
      npc: { shendu: npcProgress({ friendshipPoints: 34 }) },
    })
    expect(interactionBlockReason(state, 'shendu', 2, true)).toBe(
      '友情 34/50',
    )
    expect(romanceBlockReason(state, 'shendu')).toBe('友情 34/50')
  })

  it('prioritizes the daily cap and energy shortage', () => {
    const capped = gameState({
      npc: {
        shendu: npcProgress({
          friendshipPoints: 50,
          interactionsToday: 3,
        }),
      },
    })
    expect(interactionBlockReason(capped, 'shendu', 1)).toBe('今日互动 3/3')

    const tired = gameState({
      bond: 0,
      npc: { shendu: npcProgress({ friendshipPoints: 50 }) },
    })
    expect(interactionBlockReason(tired, 'shendu', 2, true)).toBe('精力 0/2')
  })

  it('lists relationship, room and fee gaps for inviting someone home', () => {
    const state = gameState({
      coins: 8,
      npc: {
        shendu: npcProgress({
          friendshipPoints: 90,
          romanceUnlocked: true,
          romancePoints: 105,
        }),
      },
    })
    expect(inviteRequirements(state, 'shendu')).toEqual([
      { label: '关系', met: false, detail: '喜欢 105/120', value: 105, target: 120 },
      { label: '空房', met: false, detail: '空床 0/1', value: 0, target: 1 },
      { label: '安家费', met: false, detail: '金币 8/20', value: 8, target: 20 },
    ])
  })

  it('announces when every invitation condition is ready', () => {
    const state = gameState({
      coins: 20,
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'bed', type: 'bedroom', occupantId: null },
      ],
      npc: {
        shendu: npcProgress({
          friendshipPoints: 90,
          romanceUnlocked: true,
          romancePoints: 120,
        }),
      },
    })
    expect(inviteRequirements(state, 'shendu').every((item) => item.met)).toBe(
      true,
    )
  })
})
