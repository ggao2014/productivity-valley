import { describe, expect, it } from 'vitest'
import {
  completionReactionFor,
  dialogueEntriesFor,
  dialogueFor,
} from '../dialogue'
import { NPC_DEFS } from '../npcs'
import type { DialogueKind, Task } from '../types'
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
    expect(first.text.length).toBeGreaterThan(6)

    const withOneDone = gameState({
      tasks: [{ ...task, id: 'done', done: true }],
    })
    const second = completionReactionFor(withOneDone, task)
    expect(second.npcId).toBe('qinghe')
    expect(second.text.length).toBeGreaterThan(4)
  })

  it('can surface a distinct completion reaction from every defined NPC', () => {
    const allMet = Object.fromEntries(
      NPC_DEFS.map((npc) => [npc.id, npcProgress({ met: true })]),
    )
    const task: Task = {
      id: 'current',
      title: '完成检查',
      difficulty: 'small',
      done: false,
      createdAt: '2026-07-30T10:00:00.000Z',
    }
    const reactions = NPC_DEFS.map((_, index) =>
      completionReactionFor(
        gameState({
          npc: allMet,
          tasks: Array.from({ length: index }, (__, taskIndex) => ({
            ...task,
            id: `done-${taskIndex}`,
            done: true,
          })),
        }),
        task,
      ),
    )

    expect(new Set(reactions.map((reaction) => reaction.npcId))).toEqual(
      new Set(NPC_DEFS.map((npc) => npc.id)),
    )
    expect(new Set(reactions.map((reaction) => reaction.text)).size).toBe(
      NPC_DEFS.length,
    )
  })
})

describe('conditional dialogue selection', () => {
  it('uses V3 content IDs for every defined NPC so old saves see the rewrites', () => {
    for (const { id: npcId } of NPC_DEFS) {
      expect(
        dialogueFor(gameState(), npcId, 'chat', 0, new Date(2026, 6, 30, 14))
          .entryId,
      ).toMatch(new RegExp(`^${npcId}-v3-chat-`))
    }
  })

  it('keeps profile voices and household lines distinct across the cast', () => {
    expect(new Set(NPC_DEFS.map((npc) => npc.voice)).size).toBe(NPC_DEFS.length)
    expect(new Set(NPC_DEFS.map((npc) => npc.inviteLine)).size).toBe(
      NPC_DEFS.length,
    )
    expect(new Set(NPC_DEFS.map((npc) => npc.leaveLine)).size).toBe(
      NPC_DEFS.length,
    )
  })

  it('prioritizes an unread living-at-home line, then advances past it', () => {
    const living = gameState({
      npc: {
        shendu: npcProgress({
          livingAtHome: true,
        }),
      },
    })
    const first = dialogueFor(living, 'shendu', 'chat', 0, new Date(2026, 6, 30, 14))
    expect(first.entryId).toBe('shendu-v3-chat-0')
    expect(first.text).toContain('蓑衣')

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
    const allDailyLines: string[] = []
    for (const { id: npcId } of NPC_DEFS) {
      const entries = dialogueEntriesFor(npcId, 'chat')
      allDailyLines.push(...entries.map((entry) => entry.text))
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
    expect(new Set(allDailyLines).size).toBe(allDailyLines.length)
  })

  it('provides every special interaction type for every defined NPC', () => {
    const specialKinds: readonly DialogueKind[] = [
      'heart',
      'romance',
      'giftLiked',
      'giftNeutral',
      'giftDisliked',
      'tea',
      'invite',
    ]

    for (const { id: npcId } of NPC_DEFS) {
      for (const kind of specialKinds) {
        const entries = dialogueEntriesFor(npcId, kind)
        expect(entries.length, `${npcId}/${kind}`).toBeGreaterThan(0)
        expect(entries.every((entry) => entry.text.trim().length > 0)).toBe(true)
      }
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
    expect(morning.text).toContain('熬')
    expect(afternoon.text).not.toContain('熬一会儿')
  })

  it('only gives Taotao household and workshop lines in matching contexts', () => {
    const plain = gameState()
    const plainLines = dialogueEntriesFor('taotao', 'chat').filter(
      (entry) => entry.condition === undefined,
    )
    expect(
      plainLines.every(
        (entry) => !/(书房|厨房|卧室|客房|储藏间)/.test(entry.text),
      ),
    ).toBe(true)

    const kitchen = gameState({
      rooms: [
        { id: 'living', type: 'living', occupantId: null },
        { id: 'kitchen', type: 'kitchen', occupantId: null },
      ],
    })
    expect(
      dialogueFor(kitchen, 'taotao', 'chat', 0, new Date(2026, 6, 30, 14)).text,
    ).toContain('文火')

    const living = gameState({
      npc: {
        ...plain.npc,
        taotao: npcProgress({ livingAtHome: true }),
      },
    })
    expect(
      dialogueFor(living, 'taotao', 'chat', 0, new Date(2026, 6, 30, 14)).text,
    ).toContain('糖兔子')
  })
})
