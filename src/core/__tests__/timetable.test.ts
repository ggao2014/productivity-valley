import { describe, expect, it } from 'vitest'
import {
  cellsForWeekday,
  clearTimetableCell,
  markedTimetableCount,
  normalizeTimetableTitle,
  parseTimetableCellKey,
  sanitizeTimetableCell,
  timetableCellKey,
  timetableCellLabel,
  upsertTimetableCell,
} from '../timetable'

describe('preview timetable', () => {
  it('builds stable weekday-slot keys without calendar dates', () => {
    expect(timetableCellKey(1, 'morning')).toBe('1:morning')
    expect(parseTimetableCellKey('5:evening')).toEqual({
      weekday: 5,
      slot: 'evening',
    })
    expect(parseTimetableCellKey('2026-09-04')).toBeNull()
    expect(timetableCellLabel(2, 'afternoon')).toBe('周二下午')
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

  it('upserts and clears cells independently', () => {
    const first = upsertTimetableCell({}, 1, 'morning', {
      title: '写材料',
      tone: 'focus',
    })
    const second = upsertTimetableCell(first, 3, 'afternoon', {
      title: '开会',
      tone: 'busy',
    })
    expect(second).toEqual({
      '1:morning': { title: '写材料', tone: 'focus' },
      '3:afternoon': { title: '开会', tone: 'busy' },
    })
    expect(markedTimetableCount(second)).toBe(2)
    expect(cellsForWeekday(second, 1)).toEqual([
      { slot: 'morning', cell: { title: '写材料', tone: 'focus' } },
      { slot: 'afternoon', cell: undefined },
      { slot: 'evening', cell: undefined },
    ])
    expect(clearTimetableCell(second, 1, 'morning')).toEqual({
      '3:afternoon': { title: '开会', tone: 'busy' },
    })
  })
})
