import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadState,
  parseImportedState,
  serializeState,
} from '../storage'
import { gameState, memoryStorage } from './fixtures'

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
})

describe('versioned saves', () => {
  it('writes the current schema and excludes transient interface state', () => {
    const raw = serializeState(
      gameState({
        toast: 'temporary',
        selectedNpcId: 'shendu',
        selectedRoomId: 'bedroom-1',
        selectedEventId: 'shendu-f1-riverbank',
        rewardFeedback: { id: 'reward', coins: 10, bond: 1 },
        taskReaction: {
          id: 'reaction',
          taskId: 'task',
          npcId: 'shendu',
          text: 'temporary',
        },
        valleyRewardReady: true,
        lastBuiltRoomId: 'new-room',
      }),
    )
    const parsed = JSON.parse(raw)
    expect(parsed.schemaVersion).toBe(21)
    expect(parsed.state.toast).toBeUndefined()
    expect(parsed.state.selectedNpcId).toBeUndefined()
    expect(parsed.state.selectedRoomId).toBeUndefined()
    expect(parsed.state.selectedEventId).toBeUndefined()
    expect(parsed.state.rewardFeedback).toBeUndefined()
    expect(parsed.state.taskReaction).toBeUndefined()
    expect(parsed.state.valleyRewardReady).toBeUndefined()
    expect(parsed.state.lastBuiltRoomId).toBeUndefined()
  })

  it('loads legacy unwrapped state and marks it for migration', () => {
    localStorage.setItem('productivity-valley-v1', JSON.stringify(gameState()))
    const result = loadState()
    expect(result.source).toBe('primary')
    expect(result.migrated).toBe(true)
    expect(result.state?.coins).toBe(40)
  })

  it('recovers from the last valid backup when primary is corrupt', () => {
    localStorage.setItem('productivity-valley-v1', '{broken')
    localStorage.setItem(
      'productivity-valley-backup-v1',
      serializeState(gameState({ coins: 123 })),
    )
    const result = loadState()
    expect(result.source).toBe('backup')
    expect(result.state?.coins).toBe(123)
  })

  it('rejects malformed and future-version imports', () => {
    expect(() =>
      parseImportedState(
        JSON.stringify({ schemaVersion: 2, state: { coins: 'many' } }),
      ),
    ).toThrow('存档内容不完整')
    expect(() =>
      parseImportedState(
        JSON.stringify({ schemaVersion: 99, state: gameState() }),
      ),
    ).toThrow('这个存档来自更新版本')
  })

  it('accepts a level-four bedroom compound but rejects level-four utility rooms', () => {
    const compoundSave = gameState({
      courtyardLevel: 4,
      rooms: [
        { id: 'living', type: 'living', occupantId: null, level: 3 },
        {
          id: 'compound',
          type: 'bedroom',
          occupantId: null,
          wingOccupantIds: [null, null],
          level: 4,
        },
      ],
    })

    expect(parseImportedState(serializeState(compoundSave)).rooms).toEqual(
      compoundSave.rooms,
    )

    const invalid = JSON.parse(serializeState(compoundSave))
    invalid.state.rooms[1].type = 'kitchen'
    expect(() => parseImportedState(JSON.stringify(invalid))).toThrow(
      '存档内容不完整',
    )
  })
})
