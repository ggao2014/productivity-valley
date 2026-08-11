import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../gameStore'
import { gameState, memoryStorage, npcProgress } from './fixtures'
import { serializeState } from '../storage'
import { localDayKey } from '../economy'

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
  useGameStore.setState(gameState())
})

describe('built-in facility migration', () => {
  it('keeps levels, frees courtyard space and refunds old purchases once', () => {
    const envelope = JSON.parse(serializeState(gameState({
      coins: 40,
      lastDailyKey: localDayKey(),
      rooms: [
        { id: 'living', type: 'living', occupantId: null, level: 2 },
        { id: 'study', type: 'study', occupantId: null, level: 2 },
        { id: 'storage', type: 'storage', occupantId: null, level: 3 },
        { id: 'bedroom', type: 'bedroom', occupantId: null, level: 1 },
      ],
    })))
    envelope.schemaVersion = 13
    delete envelope.state.facilityMigrationVersion
    localStorage.setItem('productivity-valley-v1', JSON.stringify(envelope))

    useGameStore.getState().hydrate()
    const migrated = useGameStore.getState()
    expect(migrated.coins).toBe(250)
    expect(migrated.rooms.find((room) => room.type === 'study')?.level).toBe(2)
    expect(migrated.rooms.find((room) => room.type === 'storage')?.level).toBe(3)
    expect(migrated.facilityMigrationVersion).toBe(1)

    useGameStore.getState().hydrate()
    expect(useGameStore.getState().coins).toBe(250)
  })
})

describe('task rewards', () => {
  it('awards the configured reward without exceeding the energy cap', () => {
    useGameStore.setState(
      gameState({
        bond: 9,
        tasks: [
          {
            id: 'task-1',
            title: 'finish',
            difficulty: 'large',
            done: false,
            createdAt: '2026-07-30T00:00:00.000Z',
          },
        ],
      }),
    )
    useGameStore.getState().completeTask('task-1')
    const state = useGameStore.getState()
    expect(state.coins).toBe(90)
    expect(state.bond).toBe(10)
    expect(state.tasks[0].done).toBe(true)
    expect(state.tasks[0].awardedCoins).toBe(50)
    expect(state.tasks[0].awardedBond).toBe(1)
    expect(state.rewardFeedback).toMatchObject({ coins: 50, bond: 1 })
    expect(state.taskReaction).toBeNull()
  })

  it('shows a completion reaction only after chatting with someone', () => {
    useGameStore.setState(
      gameState({
        coins: 40,
        bond: 9,
        npc: {
          ...gameState().npc,
          shendu: npcProgress({ met: true, interacted: true }),
        },
        tasks: [
          {
            id: 'task-1',
            title: '重要',
            difficulty: 'large',
            done: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    )
    useGameStore.getState().completeTask('task-1')
    expect(useGameStore.getState().taskReaction).toMatchObject({
      taskId: 'task-1',
      npcId: 'shendu',
    })
  })

  it('edits an open task and precisely reverses a same-day completion', () => {
    useGameStore.setState(
      gameState({
        coins: 40,
        bond: 9,
        tasks: [
          {
            id: 'task-1',
            title: 'draft',
            difficulty: 'small',
            done: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    )
    useGameStore.getState().editTask('task-1', 'revised', 'large')
    useGameStore.getState().completeTask('task-1')
    expect(useGameStore.getState().coins).toBe(90)
    expect(useGameStore.getState().bond).toBe(10)

    useGameStore.getState().undoCompleteTask('task-1')
    const state = useGameStore.getState()
    expect(state.tasks[0]).toMatchObject({
      title: 'revised',
      difficulty: 'large',
      done: false,
    })
    expect(state.tasks[0].completedAt).toBeUndefined()
    expect(state.coins).toBe(40)
    expect(state.bond).toBe(9)
    expect(state.taskReaction).toBeNull()
  })
})

describe('daily interaction cap', () => {
  it('plays the first-meet line on the first chat, then normal chat lines', () => {
    useGameStore.setState(
      gameState({
        bond: 10,
        npc: { shendu: npcProgress({ met: true, interacted: false }) },
      }),
    )
    useGameStore.getState().chat('shendu')
    expect(useGameStore.getState().dialogue).toMatchObject({
      kind: 'meet',
      text: '……嗯。你是新来的。',
    })
    expect(useGameStore.getState().npc.shendu.interacted).toBe(true)

    useGameStore.getState().clearDialogue()
    useGameStore.getState().chat('shendu')
    expect(useGameStore.getState().dialogue?.kind).toBe('chat')
  })

  it('allows three chats and rejects the fourth without charging energy', () => {
    useGameStore.setState(
      gameState({
        bond: 10,
        npc: { shendu: npcProgress() },
      }),
    )
    const chat = useGameStore.getState().chat
    chat('shendu')
    chat('shendu')
    chat('shendu')
    chat('shendu')
    const state = useGameStore.getState()
    expect(state.npc.shendu.interactionsToday).toBe(3)
    expect(state.npc.shendu.friendshipPoints).toBe(24)
    expect(state.bond).toBe(7)
  })
})

describe('gift preference discovery', () => {
  it('rewards a liked gift and records the discovered preference', () => {
    useGameStore.setState(
      gameState({
        inventory: [{ id: 'ginger_soup', qty: 1 }],
        npc: {
          shendu: npcProgress({
            interacted: true,
            romanceUnlocked: true,
            romancePoints: 30,
          }),
        },
      }),
    )
    useGameStore.getState().giveGift('shendu', 'ginger_soup')
    const progress = useGameStore.getState().npc.shendu
    expect(progress.friendshipPoints).toBe(10)
    expect(progress.romancePoints).toBe(48)
    expect(progress.giftDiscoveries.ginger_soup).toBe('liked')
    expect(useGameStore.getState().dialogue?.kind).toBe('giftLiked')
  })

  it('gives only minimal friendship for a disliked gift and records it', () => {
    useGameStore.setState(
      gameState({
        inventory: [{ id: 'trinket', qty: 1 }],
        npc: {
          shendu: npcProgress({
            interacted: true,
            romanceUnlocked: true,
            romancePoints: 30,
          }),
        },
      }),
    )
    useGameStore.getState().giveGift('shendu', 'trinket')
    const progress = useGameStore.getState().npc.shendu
    expect(progress.friendshipPoints).toBe(1)
    expect(progress.romancePoints).toBe(30)
    expect(progress.giftDiscoveries.trinket).toBe('disliked')
    expect(useGameStore.getState().dialogue?.kind).toBe('giftDisliked')
  })

  it('deep-merges v3 NPC progress with new content-tracking fields', () => {
    const legacy = gameState()
    const legacyNpc = Object.fromEntries(
      Object.entries(legacy.npc).map(([id, progress]) => {
        const {
          giftDiscoveries: _giftDiscoveries,
          seenDialogueIds: _seenDialogueIds,
          unlockedEventIds: _unlockedEventIds,
          ...oldProgress
        } = progress
        return [id, oldProgress]
      }),
    )
    localStorage.setItem(
      'productivity-valley-v1',
      JSON.stringify({
        schemaVersion: 3,
        savedAt: new Date().toISOString(),
        state: { ...legacy, npc: legacyNpc },
      }),
    )
    useGameStore.getState().hydrate()
    expect(useGameStore.getState().npc.shendu.giftDiscoveries).toEqual({})
    expect(useGameStore.getState().npc.shendu.seenDialogueIds).toEqual([])
    expect(useGameStore.getState().npc.shendu.unlockedEventIds).toEqual([])
  })

  it('preserves upgraded rooms and infers a compatible courtyard for v12 saves', () => {
    const legacy = gameState({
      rooms: [
        { id: 'living', type: 'living', occupantId: null, level: 3 },
        { id: 'bedroom-1', type: 'bedroom', occupantId: null, level: 3 },
        { id: 'bedroom-2', type: 'bedroom', occupantId: null, level: 2 },
        { id: 'kitchen', type: 'kitchen', occupantId: null, level: 2 },
        { id: 'study', type: 'study', occupantId: null, level: 1 },
      ],
    })
    delete (legacy as Partial<typeof legacy>).courtyardLevel
    localStorage.setItem(
      'productivity-valley-v1',
      JSON.stringify({
        schemaVersion: 12,
        savedAt: new Date().toISOString(),
        state: legacy,
      }),
    )

    useGameStore.getState().hydrate()

    const state = useGameStore.getState()
    expect(state.courtyardLevel).toBe(2)
    expect(state.rooms.find((room) => room.id === 'living')?.level).toBe(3)
    expect(state.rooms.find((room) => room.id === 'bedroom-1')?.level).toBe(3)
  })
})

describe('decorations', () => {
  it('buys, places, and stores a decoration without losing ownership', () => {
    useGameStore.setState(gameState({ coins: 100 }))
    useGameStore.getState().buyDecoration('clay_flowerpot')
    expect(useGameStore.getState()).toMatchObject({
      coins: 82,
      decorations: ['clay_flowerpot'],
      placedDecorations: ['clay_flowerpot'],
    })

    useGameStore.getState().toggleDecoration('clay_flowerpot')
    expect(useGameStore.getState().decorations).toContain('clay_flowerpot')
    expect(useGameStore.getState().placedDecorations).not.toContain(
      'clay_flowerpot',
    )
  })

  it('limits the visible yard to six decorations', () => {
    const ids = [
      'clay_flowerpot',
      'bamboo_lantern',
      'wooden_stool',
      'reed_basket',
      'stone_basin',
      'firewood_bundle',
      'water_jar',
    ]
    useGameStore.setState(
      gameState({
        decorations: ids,
        placedDecorations: ids.slice(0, 6),
      }),
    )
    useGameStore.getState().toggleDecoration('water_jar')
    expect(useGameStore.getState().placedDecorations).toHaveLength(6)
    expect(useGameStore.getState().placedDecorations).not.toContain('water_jar')
    expect(useGameStore.getState().toast).toContain('最多同时摆 6 件')
  })

  it('buys and switches one courtyard landscape at a time', () => {
    useGameStore.setState(gameState({
      coins: 250,
      courtyardLevel: 2,
      decorations: [
        'clay_flowerpot',
        'bamboo_lantern',
        'wooden_stool',
        'reed_basket',
        'stone_basin',
        'firewood_bundle',
      ],
    }))
    useGameStore.getState().buyCourtyardLandscape('old_tree')
    expect(useGameStore.getState()).toMatchObject({
      coins: 160,
      ownedLandscapes: ['open', 'old_tree'],
      courtyardLandscape: 'old_tree',
    })

    useGameStore.getState().selectCourtyardLandscape('open')
    expect(useGameStore.getState().courtyardLandscape).toBe('open')
  })

  it('does not buy a landscape that the current courtyard cannot hold', () => {
    useGameStore.setState(gameState({ coins: 300, courtyardLevel: 1 }))
    useGameStore.getState().buyCourtyardLandscape('pond')
    expect(useGameStore.getState().ownedLandscapes).toEqual(['open'])
    expect(useGameStore.getState().coins).toBe(300)
  })
})

describe('relationship event unlocking', () => {
  it('unlocks the first friendship event when a chat crosses its threshold', () => {
    useGameStore.setState(
      gameState({
        bond: 5,
        npc: {
          shendu: npcProgress({ friendshipPoints: 16 }),
        },
      }),
    )
    useGameStore.getState().chat('shendu')
    expect(useGameStore.getState().npc.shendu.unlockedEventIds).toContain(
      'shendu-f1-riverbank',
    )
  })

  it('unlocks romance events only after the romance line is open', () => {
    useGameStore.setState(
      gameState({
        bond: 5,
        npc: {
          shendu: npcProgress({
            friendshipPoints: 50,
            romancePoints: 30,
          }),
        },
      }),
    )
    useGameStore.getState().chat('shendu')
    expect(useGameStore.getState().npc.shendu.unlockedEventIds).not.toContain(
      'shendu-r1-shared-boat',
    )

    useGameStore.setState((state) => ({
      npc: {
        ...state.npc,
        shendu: {
          ...state.npc.shendu,
          romanceUnlocked: true,
          interactionsToday: 0,
        },
      },
    }))
    useGameStore.getState().chat('shendu')
    expect(useGameStore.getState().npc.shendu.unlockedEventIds).toContain(
      'shendu-r1-shared-boat',
    )
  })
})

describe('dialogue read state', () => {
  it('records a line as read only after the player continues', () => {
    useGameStore.setState(
      gameState({
        dialogue: {
          entryId: 'shendu-chat-1',
          npcId: 'shendu',
          kind: 'chat',
          text: 'line',
          tone: 'neutral',
        },
      }),
    )
    useGameStore.getState().clearDialogue()
    expect(useGameStore.getState().dialogue).toBeNull()
    expect(useGameStore.getState().npc.shendu.seenDialogueIds).toContain(
      'shendu-chat-1',
    )
  })
})

describe('cohabiting', () => {
  it('charges the home fee, occupies a bed, and can separate cleanly', () => {
    useGameStore.setState(
      gameState({
        coins: 50,
        rooms: [
          { id: 'living', type: 'living', occupantId: null },
          { id: 'bed', type: 'bedroom', occupantId: null },
        ],
        npc: {
          shendu: npcProgress({
            romanceUnlocked: true,
            romancePoints: 120,
          }),
        },
      }),
    )
    useGameStore.getState().invitePartner('shendu')
    expect(useGameStore.getState().coins).toBe(30)
    expect(useGameStore.getState().rooms[1].occupantId).toBe('shendu')
    expect(useGameStore.getState().npc.shendu.livingAtHome).toBe(true)

    useGameStore.getState().separatePartner('shendu')
    expect(useGameStore.getState().rooms[1].occupantId).toBeNull()
    expect(useGameStore.getState().npc.shendu.livingAtHome).toBe(false)
  })

  it('supports the complete invitation path for all three core characters', () => {
    for (const npcId of ['shendu', 'guwan', 'taotao']) {
      useGameStore.setState(
        gameState({
          coins: 50,
          rooms: [
            { id: 'living', type: 'living', occupantId: null },
            { id: `bed-${npcId}`, type: 'bedroom', occupantId: null },
          ],
          npc: {
            [npcId]: npcProgress({
              friendshipPoints: 90,
              romanceUnlocked: true,
              romancePoints: 120,
            }),
          },
        }),
      )
      useGameStore.getState().invitePartner(npcId)
      const state = useGameStore.getState()
      expect(state.npc[npcId].livingAtHome).toBe(true)
      expect(state.rooms[1].occupantId).toBe(npcId)
      expect(state.dialogue?.npcId).toBe(npcId)
      expect(state.dialogue?.kind).toBe('invite')
    }
  })
})

describe('visible room construction', () => {
  it('expands a full small courtyard into a three-sided courtyard', () => {
    useGameStore.setState(
      gameState({
        coins: 300,
        courtyardLevel: 1,
        rooms: [
          { id: 'living', type: 'living', occupantId: null, level: 1 },
          { id: 'bedroom-1', type: 'bedroom', occupantId: null, level: 1 },
          { id: 'bedroom-2', type: 'bedroom', occupantId: null, level: 1 },
        ],
      }),
    )
    useGameStore.getState().upgradeCourtyard()
    expect(useGameStore.getState().courtyardLevel).toBe(2)
    expect(useGameStore.getState().coins).toBe(200)
  })

  it('does not build beyond the current courtyard capacity', () => {
    useGameStore.setState(
      gameState({
        coins: 500,
        courtyardLevel: 1,
        rooms: [
          { id: 'living', type: 'living', occupantId: null, level: 1 },
          { id: 'bedroom-1', type: 'bedroom', occupantId: null, level: 1 },
          { id: 'bedroom-2', type: 'bedroom', occupantId: null, level: 1 },
        ],
      }),
    )
    useGameStore.getState().buyRoom('guest')
    expect(useGameStore.getState().rooms).toHaveLength(3)
    expect(useGameStore.getState().coins).toBe(500)
  })

  it('records the newly built room for the valley unfold animation', () => {
    useGameStore.setState(gameState({ coins: 200 }))
    useGameStore.getState().buyRoom('bedroom')
    const state = useGameStore.getState()
    expect(state.coins).toBe(120)
    expect(state.rooms.at(-1)?.type).toBe('bedroom')
    expect(state.lastBuiltRoomId).toBe(state.rooms.at(-1)?.id)
  })

  it('upgrades a room twice and stops charging at the maximum level', () => {
    useGameStore.setState(
      gameState({
        coins: 500,
        rooms: [
          { id: 'living-room', type: 'living', occupantId: null, level: 3 },
          { id: 'bedroom-1', type: 'bedroom', occupantId: 'taotao', level: 1 },
        ],
      }),
    )

    useGameStore.getState().upgradeRoom('bedroom-1')
    expect(useGameStore.getState().coins).toBe(440)
    expect(useGameStore.getState().rooms[1].level).toBe(2)

    useGameStore.getState().upgradeRoom('bedroom-1')
    expect(useGameStore.getState().coins).toBe(320)
    expect(useGameStore.getState().rooms[1].level).toBe(3)

    useGameStore.getState().upgradeRoom('bedroom-1')
    expect(useGameStore.getState().coins).toBe(320)
    expect(useGameStore.getState().rooms[1].level).toBe(3)
  })

  it('upgrades the player living room through all three levels', () => {
    useGameStore.setState(
      gameState({
        coins: 300,
        rooms: [
          { id: 'living-room', type: 'living', occupantId: null, level: 1 },
        ],
      }),
    )

    useGameStore.getState().upgradeRoom('living-room')
    expect(useGameStore.getState().coins).toBe(250)
    expect(useGameStore.getState().rooms[0].level).toBe(2)

    useGameStore.getState().upgradeRoom('living-room')
    expect(useGameStore.getState().coins).toBe(130)
    expect(useGameStore.getState().rooms[0].level).toBe(3)
  })

  it('upgrades a bedroom into a three-resident courtyard home', () => {
    useGameStore.setState(
      gameState({
        coins: 500,
        courtyardLevel: 4,
        rooms: [
          { id: 'living', type: 'living', occupantId: null, level: 3 },
          { id: 'bedroom-1', type: 'bedroom', occupantId: 'shendu', level: 3 },
        ],
        npc: {
          shendu: npcProgress({ livingAtHome: true }),
          taotao: npcProgress({ romanceUnlocked: true, romancePoints: 120 }),
        },
      }),
    )

    useGameStore.getState().upgradeRoom('bedroom-1')
    expect(useGameStore.getState().rooms[1]).toMatchObject({
      level: 4,
      occupantId: 'shendu',
      wingOccupantIds: [null, null],
    })

    useGameStore.getState().invitePartner('taotao')
    expect(useGameStore.getState().rooms[1].wingOccupantIds).toEqual(['taotao', null])
    expect(useGameStore.getState().npc.taotao.livingAtHome).toBe(true)
  })

  it('does not upgrade when there are not enough coins', () => {
    useGameStore.setState(
      gameState({
        coins: 59,
        rooms: [
          { id: 'living-room', type: 'living', occupantId: null, level: 3 },
          { id: 'bedroom-1', type: 'bedroom', occupantId: null, level: 1 },
        ],
      }),
    )

    useGameStore.getState().upgradeRoom('bedroom-1')
    expect(useGameStore.getState().coins).toBe(59)
    expect(useGameStore.getState().rooms[1].level).toBe(1)
  })
})
