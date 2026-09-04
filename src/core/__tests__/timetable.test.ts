import { describe, expect, it } from 'vitest'
import {
  cellsForWeekday,
  clearTimetableCell,
  clearTimetableRange,
  formatTimetableHour,
  hoursInRange,
  isHourInRange,
  markedTimetableCount,
  normalizeHourRange,
  normalizeTimetableTitle,
  parseTimetableCellKey,
  sanitizeTimetable,
  sanitizeTimetableCell,
  timetableCellKey,
  timetableCellLabel,
  timetableRangeLabel,
  upsertTimetableCell,
  upsertTimetableRange,
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

  it('normalizes contiguous hour ranges for multi-slot marks', () => {
    expect(normalizeHourRange(11, 9)).toEqual({ startHour: 9, endHour: 11 })
    expect(hoursInRange(11, 9)).toEqual([9, 10, 11])
    expect(isHourInRange(10, 11, 9)).toBe(true)
    expect(isHourInRange(8, 11, 9)).toBe(false)
    expect(timetableRangeLabel(1, 9, 9)).toBe('周一 9:00')
    expect(timetableRangeLabel(1, 11, 9)).toBe('周一 9:00–12:00')
  })

  it('upserts and clears a weekday hour range as one activity', () => {
    const marked = upsertTimetableRange({}, 2, 14, 16, {
      title: '开会',
      category: 'work',
    })
    expect(marked).toEqual({
      '2:14': { title: '开会', category: 'work' },
      '2:15': { title: '开会', category: 'work' },
      '2:16': { title: '开会', category: 'work' },
    })
    expect(clearTimetableRange(marked, 2, 16, 14)).toEqual({})
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
