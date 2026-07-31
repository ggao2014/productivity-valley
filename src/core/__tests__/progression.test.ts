import { describe, expect, it } from 'vitest'
import {
  interactionBlockReason,
  inviteRequirements,
  relationshipNextStep,
  romanceBlockReason,
} from '../progression'
import { gameState, npcProgress } from './fixtures'

describe('progression guidance', () => {
  it('explains the exact friendship gap for deep conversation and romance', () => {
    const state = gameState({
      npc: { shendu: npcProgress({ friendshipPoints: 34 }) },
    })
    expect(interactionBlockReason(state, 'shendu', 2, true)).toBe(
      '还差 16 友情成为好友',
    )
    expect(romanceBlockReason(state, 'shendu')).toBe('还差 16 友情成为好友')
    expect(relationshipNextStep(state, 'shendu')).toContain('再积累 16 友情')
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
    expect(interactionBlockReason(capped, 'shendu', 1)).toContain('明天再来')

    const tired = gameState({
      bond: 0,
      npc: { shendu: npcProgress({ friendshipPoints: 50 }) },
    })
    expect(interactionBlockReason(tired, 'shendu', 2, true)).toContain(
      '完成待办',
    )
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
      { label: '关系', met: false, detail: '还差 15 喜欢' },
      { label: '空房', met: false, detail: '购买卧室或客房' },
      { label: '安家费', met: false, detail: '还差 12 金币' },
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
    expect(relationshipNextStep(state, 'shendu')).toBe(
      '条件齐了，现在可以邀请入住。',
    )
  })
})
