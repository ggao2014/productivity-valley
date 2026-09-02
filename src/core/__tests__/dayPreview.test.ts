import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  clearDayPreview,
  dayPreviewLabel,
  monthTitle,
  normalizeDayPreviewNote,
  sanitizeDayPreview,
  shiftMonth,
  upsertDayPreview,
} from '../dayPreview'

describe('day preview calendar', () => {
  it('builds a monday-first month grid with today marked', () => {
    // 2026-09-01 is Tuesday → one leading Monday pad
    const cells = buildMonthGrid(2026, 9, '2026-09-02')
    expect(monthTitle(2026, 9)).toBe('2026年9月')
    expect(cells[0]).toEqual({ kind: 'pad', key: 'pad-start-0' })
    expect(cells[1]).toMatchObject({ kind: 'day', day: 1, dayKey: '2026-09-01' })
    expect(cells.find((cell) => cell.kind === 'day' && cell.day === 2)).toMatchObject({
      isToday: true,
      dayKey: '2026-09-02',
    })
    expect(cells.length % 7).toBe(0)
  })

  it('pads leading days when the month starts mid-week', () => {
    // 2026-07-01 is Wednesday → two leading pads (Mon/Tue)
    const cells = buildMonthGrid(2026, 7, '2026-07-30')
    expect(cells.slice(0, 2)).toEqual([
      { kind: 'pad', key: 'pad-start-0' },
      { kind: 'pad', key: 'pad-start-1' },
    ])
    expect(cells[2]).toMatchObject({ kind: 'day', day: 1, dayKey: '2026-07-01' })
  })

  it('shifts months across year boundaries', () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth(2025, 12, 1)).toEqual({ year: 2026, month: 1 })
  })

  it('keeps notes short and drops empty previews', () => {
    expect(normalizeDayPreviewNote('  去看山  ')).toBe('去看山')
    expect(normalizeDayPreviewNote('a'.repeat(50)).length).toBe(40)
    expect(sanitizeDayPreview({ note: '   ' })).toBeNull()
    expect(sanitizeDayPreview({ note: '', tone: 'busy' })).toEqual({
      note: '',
      tone: 'busy',
    })
    expect(sanitizeDayPreview({ note: '开会', tone: 'nope' as never })).toEqual({
      note: '开会',
    })
  })

  it('upserts and clears day previews without touching other days', () => {
    const first = upsertDayPreview({}, '2026-09-03', {
      note: '写材料',
      tone: 'focus',
    })
    const second = upsertDayPreview(first, '2026-09-04', { note: '休息', tone: 'calm' })
    expect(second).toEqual({
      '2026-09-03': { note: '写材料', tone: 'focus' },
      '2026-09-04': { note: '休息', tone: 'calm' },
    })
    expect(upsertDayPreview(second, '2026-09-03', { note: '  ' })).toEqual({
      '2026-09-04': { note: '休息', tone: 'calm' },
    })
    expect(clearDayPreview(second, '2026-09-04')).toEqual({
      '2026-09-03': { note: '写材料', tone: 'focus' },
    })
  })

  it('labels nearby days for toast copy', () => {
    expect(dayPreviewLabel('2026-09-02', '2026-09-02')).toBe('今天')
    expect(dayPreviewLabel('2026-09-03', '2026-09-02')).toBe('明天')
    expect(dayPreviewLabel('2026-09-01', '2026-09-02')).toBe('昨天')
    expect(dayPreviewLabel('2026-09-10', '2026-09-02')).toBe('9月10日')
  })
})
