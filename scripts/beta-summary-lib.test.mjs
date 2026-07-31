import { describe, expect, it } from 'vitest'
import { summarizeBetaRecords } from './beta-summary-lib.mjs'

const record = ({
  events = [],
  understanding = 'yes',
  memorableCharacter = 'shendu',
  moreAppealing = 'yes',
  seriousSaveLoss = false,
} = {}) => ({
  understanding,
  memorableCharacter,
  moreAppealing,
  seriousSaveLoss,
  anonymousProductData: {
    events: events.map((name) => ({ name })),
  },
})

describe('closed beta decision summary', () => {
  it('computes the roadmap thresholds per returned feedback file', () => {
    const records = [
      record({ events: ['core_loop_completed', 'return_day_1'] }),
      record({ events: ['core_loop_completed'] }),
      record({
        events: ['core_loop_completed'],
        understanding: 'partly',
        memorableCharacter: 'none',
        moreAppealing: 'same',
      }),
      record({
        events: [],
        understanding: 'no',
        memorableCharacter: 'none',
        moreAppealing: 'no',
      }),
    ]
    const summary = summarizeBetaRecords(records)
    expect(summary.metrics).toMatchObject({
      feedbackFiles: 4,
      firstCoreLoopCompletion: 75,
      day1Return: 25,
      understandsCoreEconomy: 50,
      remembersACharacter: 50,
      findsValleyMoreAppealing: 50,
      seriousSaveLosses: 0,
    })
    expect(summary.gates).toEqual({
      coreLoopAtLeast70: true,
      day1AtLeast35: false,
      understandingAtLeast60: false,
      characterRecallAtLeast50: true,
      zeroSeriousSaveLoss: true,
    })
  })

  it('fails the zero-loss gate when any tester reports irreversible loss', () => {
    const summary = summarizeBetaRecords([
      record({ seriousSaveLoss: true }),
      record(),
    ])
    expect(summary.metrics.seriousSaveLosses).toBe(1)
    expect(summary.gates.zeroSeriousSaveLoss).toBe(false)
  })
})
