import { localDayKey } from './economy'
import type { DayPreview, DayPreviewTone } from './types'

export const DAY_PREVIEW_TONES: DayPreviewTone[] = [
  'calm',
  'busy',
  'focus',
  'away',
]

export const DAY_PREVIEW_TONE_LABELS: Record<DayPreviewTone, string> = {
  calm: '轻松',
  busy: '偏忙',
  focus: '专注',
  away: '外出',
}

export const DAY_PREVIEW_NOTE_MAX = 40

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'] as const

export type MonthCell =
  | { kind: 'pad'; key: string }
  | { kind: 'day'; key: string; dayKey: string; day: number; isToday: boolean }

export function shiftMonth(year: number, month: number, delta: number): {
  year: number
  month: number
} {
  const date = new Date(year, month - 1 + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function monthTitle(year: number, month: number): string {
  return `${year}年${month}月`
}

/** Monday-first month grid for a compact preview calendar. */
export function buildMonthGrid(
  year: number,
  month: number,
  todayKey = localDayKey(),
): MonthCell[] {
  const first = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const mondayIndex = (first.getDay() + 6) % 7
  const cells: MonthCell[] = []

  for (let i = 0; i < mondayIndex; i += 1) {
    cells.push({ kind: 'pad', key: `pad-start-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = localDayKey(new Date(year, month - 1, day, 12))
    cells.push({
      kind: 'day',
      key: dayKey,
      dayKey,
      day,
      isToday: dayKey === todayKey,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: 'pad', key: `pad-end-${cells.length}` })
  }

  return cells
}

export function normalizeDayPreviewNote(note: string): string {
  return note.replace(/\s+/g, ' ').trim().slice(0, DAY_PREVIEW_NOTE_MAX)
}

export function isDayPreviewTone(value: unknown): value is DayPreviewTone {
  return (
    typeof value === 'string' &&
    (DAY_PREVIEW_TONES as readonly string[]).includes(value)
  )
}

export function sanitizeDayPreview(
  value: Partial<DayPreview> | null | undefined,
): DayPreview | null {
  if (!value) return null
  const note = normalizeDayPreviewNote(value.note ?? '')
  const tone = isDayPreviewTone(value.tone) ? value.tone : undefined
  if (!note && !tone) return null
  return tone ? { note, tone } : { note }
}

export function upsertDayPreview(
  previews: Record<string, DayPreview>,
  dayKey: string,
  value: Partial<DayPreview>,
): Record<string, DayPreview> {
  const next = { ...previews }
  const sanitized = sanitizeDayPreview(value)
  if (!sanitized) {
    delete next[dayKey]
    return next
  }
  next[dayKey] = sanitized
  return next
}

export function clearDayPreview(
  previews: Record<string, DayPreview>,
  dayKey: string,
): Record<string, DayPreview> {
  if (!(dayKey in previews)) return previews
  const next = { ...previews }
  delete next[dayKey]
  return next
}

export function dayPreviewLabel(dayKey: string, todayKey = localDayKey()): string {
  if (dayKey === todayKey) return '今天'
  const today = new Date(`${todayKey}T12:00:00`)
  const target = new Date(`${dayKey}T12:00:00`)
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff === 2) return '后天'
  const [, month, day] = dayKey.split('-')
  return `${Number(month)}月${Number(day)}日`
}
