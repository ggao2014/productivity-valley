import { describe, expect, it } from 'vitest'
import {
  completionReactionFor,
  dialogueEntriesFor,
  dialogueFor,
} from '../dialogue'
import { gameState, npcProgress } from './fixtures'

describe('completion reactions', () => {
  it('rotates among met core characters and respects task difficulty', () => {
    const task = {
      id: 'new',
      title: '重要任务',
      difficulty: 'large' as const,
      done: false,
      createdAt: '2026-07-30T10:00:00.000Z',
    }
    const first = completionReactionFor(gameState(), task)
    expect(first.npcId).toBe('shendu')
    expect(first.text).toContain('难')

    const withOneDone = gameState({
      tasks: [{ ...task, id: 'done', done: true }],
    })
    const second = completionReactionFor(withOneDone, task)
    expect(second.npcId).toBe('guwan')
    expect(second.text.length).toBeGreaterThan(4)
  })
})

describe('conditional dialogue selection', () => {
  it('prioritizes an unread living-at-home line, then advances past it', () => {
    const living = gameState({
      npc: {
        shendu: npcProgress({
          livingAtHome: true,
        }),
      },
    })
    const first = dialogueFor(living, 'shendu', 'chat', 0, new Date(2026, 6, 30, 14))
    expect(first.entryId).toBe('shendu-chat-0')
    expect(first.text).toContain('竹篙')

    const read = {
      ...living,
      npc: {
        ...living.npc,
        shendu: {
          ...living.npc.shendu,
          seenDialogueIds: [first.entryId],
        },
      },
    }
    const next = dialogueFor(
      read,
      'shendu',
      'chat',
      0,
      new Date(2026, 6, 30, 14),
    )
    expect(next.entryId).not.toBe(first.entryId)
  })

  it('keeps 20–30 unique daily lines and a full seven-day base pool', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      const entries = dialogueEntriesFor(npcId, 'chat')
      expect(entries.length).toBeGreaterThanOrEqual(20)
      expect(entries.length).toBeLessThanOrEqual(30)
      expect(new Set(entries.map((entry) => entry.text)).size).toBe(
        entries.length,
      )
      expect(new Set(entries.map((entry) => entry.tone)).size).toBeGreaterThanOrEqual(
        4,
      )
      expect(
        entries.filter((entry) => entry.condition !== undefined).length,
      ).toBe(7)
      expect(
        entries.filter((entry) => entry.condition === undefined).length,
      ).toBeGreaterThanOrEqual(21)
    }
  })

  it('matches room and time conditions only when their context is present', () => {
    const kitchen = gameState({
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'kitchen', type: 'kitchen', occupantId: null },
      ],
    })
    expect(
      dialogueFor(kitchen, 'guwan', 'chat', 0, new Date(2026, 6, 30, 14)).text,
    ).toContain('厨房')

    const morning = dialogueFor(
      gameState(),
      'taotao',
      'chat',
      0,
      new Date(2026, 6, 30, 8),
    )
    const afternoon = dialogueFor(
      gameState(),
      'taotao',
      'chat',
      0,
      new Date(2026, 6, 30, 14),
    )
    expect(morning.text).toContain('早呀')
    expect(afternoon.text).not.toContain('早呀')
  })
})
