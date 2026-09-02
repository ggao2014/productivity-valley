import { describe, expect, it } from 'vitest'
import {
  cellsForWeekday,
  clearTimetableCell,
  formatTimetableHour,
  markedTimetableCount,
  normalizeTimetableTitle,
  parseTimetableCellKey,
  sanitizeTimetable,
  sanitizeTimetableCell,
  timetableCellKey,
  timetableCellLabel,
  upsertTimetableCell,
} from '../timetable'

describe('preview timetable', () => {
  it('uses clock-hour keys without calendar dates', () => {
    expect(timetableCellKey(1, 9)).toBe('1:9')
    expect(formatTimetableHour(9)).toBe('9:00')
    expect(parseTimetableCellKey('5:14')).toEqual({
      weekday: 5,
      hour: 14,
    })
    expect(parseTimetableCellKey('1:morning')).toBeNull()
    expect(timetableCellLabel(2, 15)).toBe('周二 15:00')
  })

  it('keeps titles short and stores todo categories', () => {
    expect(normalizeTimetableTitle('  写材料  ')).toBe('写材料')
    expect(sanitizeTimetableCell({ title: '   ' })).toBeNull()
    expect(
      sanitizeTimetableCell({ title: '开会', category: 'work' }),
    ).toEqual({ title: '开会', category: 'work' })
    expect(
      sanitizeTimetableCell({ title: '开会', category: 'nope' as never }),
    ).toEqual({ title: '开会' })
  })

  it('upserts and clears hour cells independently', () => {
    const first = upsertTimetableCell({}, 1, 9, {
      title: '写材料',
      category: 'study',
    })
    const second = upsertTimetableCell(first, 3, 14, {
      title: '开会',
      category: 'work',
    })
    expect(second).toEqual({
      '1:9': { title: '写材料', category: 'study' },
      '3:14': { title: '开会', category: 'work' },
    })
    expect(markedTimetableCount(second)).toBe(2)
    expect(cellsForWeekday(second, 1).find((item) => item.hour === 9)?.cell).toEqual({
      title: '写材料',
      category: 'study',
    })
    expect(clearTimetableCell(second, 1, 9)).toEqual({
      '3:14': { title: '开会', category: 'work' },
    })
  })

  it('drops legacy tone marks when sanitizing', () => {
    expect(
      sanitizeTimetable({
        '1:9': { title: '旧的', tone: 'busy' } as never,
        '2:10': { title: '新的', category: 'life' },
      }),
    ).toEqual({
      '1:9': { title: '旧的' },
      '2:10': { title: '新的', category: 'life' },
    })
  })
})
