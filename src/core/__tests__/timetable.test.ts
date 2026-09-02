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
  it('uses clock-hour keys without calendar dates or am/pm buckets', () => {
    expect(timetableCellKey(1, 9)).toBe('1:9')
    expect(formatTimetableHour(9)).toBe('9:00')
    expect(parseTimetableCellKey('5:14')).toEqual({
      weekday: 5,
      hour: 14,
    })
    expect(parseTimetableCellKey('1:morning')).toBeNull()
    expect(parseTimetableCellKey('2026-09-04')).toBeNull()
    expect(timetableCellLabel(2, 15)).toBe('周二 15:00')
  })

  it('keeps titles short and drops empty cells', () => {
    expect(normalizeTimetableTitle('  写材料  ')).toBe('写材料')
    expect(normalizeTimetableTitle('a'.repeat(40)).length).toBe(24)
    expect(sanitizeTimetableCell({ title: '   ' })).toBeNull()
    expect(sanitizeTimetableCell({ title: '', tone: 'busy' })).toEqual({
      title: '',
      tone: 'busy',
    })
  })

  it('upserts and clears hour cells independently', () => {
    const first = upsertTimetableCell({}, 1, 9, {
      title: '写材料',
      tone: 'focus',
    })
    const second = upsertTimetableCell(first, 3, 14, {
      title: '开会',
      tone: 'busy',
    })
    expect(second).toEqual({
      '1:9': { title: '写材料', tone: 'focus' },
      '3:14': { title: '开会', tone: 'busy' },
    })
    expect(markedTimetableCount(second)).toBe(2)
    const monday = cellsForWeekday(second, 1)
    expect(monday.find((item) => item.hour === 9)?.cell).toEqual({
      title: '写材料',
      tone: 'focus',
    })
    expect(monday.find((item) => item.hour === 10)?.cell).toBeUndefined()
    expect(clearTimetableCell(second, 1, 9)).toEqual({
      '3:14': { title: '开会', tone: 'busy' },
    })
  })

  it('drops legacy morning/afternoon keys when sanitizing', () => {
    expect(
      sanitizeTimetable({
        '1:morning': { title: '旧的' },
        '2:10': { title: '新的' },
      }),
    ).toEqual({
      '2:10': { title: '新的' },
    })
  })
})
