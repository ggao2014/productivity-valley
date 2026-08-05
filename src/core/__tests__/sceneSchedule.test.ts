import { describe, expect, it } from 'vitest'
import { scenePopulationLimit, scheduledActivity } from '../sceneSchedule'

describe('scene activity schedule', () => {
  it('keeps a character in the same place throughout a day', () => {
    const morning = scheduledActivity('shendu', false, new Date(2026, 6, 31, 8))
    const evening = scheduledActivity('shendu', false, new Date(2026, 6, 31, 20))
    expect(evening).toEqual(morning)
    expect(morning.label).toMatch(/河边|渡口/)
  })

  it('uses character-specific work areas', () => {
    expect(scheduledActivity('qinghe', false, new Date(2026, 6, 31)).label).toMatch(
      /菜地|田埂/,
    )
    expect(scheduledActivity('taotao', false, new Date(2026, 6, 31)).label).toMatch(
      /小路|路口/,
    )
  })

  it('keeps visitors outside and only places residents in the courtyard', () => {
    const now = new Date(2026, 6, 31, 9)
    expect(scheduledActivity('shendu', false, now).zone).toBe('outside')
    expect(scheduledActivity('shendu', true, now).zone).toBe('courtyard')
  })

  it('places residents at activity points belonging to the selected main landscape', () => {
    const activity = scheduledActivity(
      'shendu',
      true,
      new Date(2026, 6, 31, 9),
      'pond',
    )
    expect(activity.zone).toBe('courtyard')
    expect(activity.label).toMatch(/池边|桥边/)
  })

  it('keeps every visitor activity point beyond the courtyard footprint', () => {
    const npcIds = [
      'shendu', 'qinghe', 'guwan', 'jiangxiaoman', 'chenshi', 'taotao',
      'linchu', 'baizhi', 'suweiming', 'yueqingshan', 'wenjiu', 'hedeng', 'unknown',
    ]

    for (const npcId of npcIds) {
      for (let day = 1; day <= 8; day += 1) {
        const activity = scheduledActivity(npcId, false, new Date(2026, 6, day, 9))
        const left = Number.parseFloat(activity.left)
        const top = Number.parseFloat(activity.top)
        expect(left <= 14 || left >= 86 || top >= 83).toBe(true)
      }
    }
  })

  it('makes outside visits occasional and residents more likely to appear', () => {
    let visitorDays = 0
    let residentDays = 0
    for (let day = 1; day <= 120; day += 1) {
      const now = new Date(2026, 0, day, 9)
      if (scheduledActivity('shendu', false, now).appears) visitorDays += 1
      if (scheduledActivity('shendu', true, now).appears) residentDays += 1
    }
    expect(visitorDays).toBeLessThan(45)
    expect(residentDays).toBeGreaterThan(visitorDays)
  })

  it('changes schedules between days', () => {
    const days = [31, 1, 2, 3, 4].map((day, index) =>
      scheduledActivity(
        'guwan',
        false,
        new Date(2026, index === 0 ? 6 : 7, day),
      ),
    )
    expect(new Set(days.map((item) => `${item.appears}:${item.label}`)).size).toBeGreaterThan(1)
  })

  it('keeps the daily scene population between zero and two', () => {
    const limits = Array.from({ length: 21 }, (_, day) =>
      scenePopulationLimit(new Date(2026, 7, day + 1)),
    )
    expect(limits.every((value) => value >= 0 && value <= 2)).toBe(true)
    expect(new Set(limits)).toEqual(new Set([0, 1, 2]))
  })
})
