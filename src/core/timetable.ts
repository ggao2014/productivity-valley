import type { TimetableCell, TimetableSlot, TimetableTone, TimetableWeekday } from './types'

export const TIMETABLE_SLOTS: TimetableSlot[] = ['morning', 'afternoon', 'evening']

export const TIMETABLE_SLOT_LABELS: Record<TimetableSlot, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
}

/** Monday-first weekday order for the week grid. */
export const TIMETABLE_WEEKDAYS: TimetableWeekday[] = [1, 2, 3, 4, 5, 6, 0]

export const TIMETABLE_WEEKDAY_LABELS: Record<TimetableWeekday, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  0: '日',
}

export const TIMETABLE_TONES: TimetableTone[] = ['calm', 'busy', 'focus', 'away']

export const TIMETABLE_TONE_LABELS: Record<TimetableTone, string> = {
  calm: '轻松',
  busy: '偏忙',
  focus: '专注',
  away: '外出',
}

export const TIMETABLE_TITLE_MAX = 24

export function timetableCellKey(
  weekday: TimetableWeekday,
  slot: TimetableSlot,
): string {
  return `${weekday}:${slot}`
}

export function parseTimetableCellKey(
  key: string,
): { weekday: TimetableWeekday; slot: TimetableSlot } | null {
  const [weekdayRaw, slotRaw] = key.split(':')
  const weekday = Number(weekdayRaw)
  if (![0, 1, 2, 3, 4, 5, 6].includes(weekday)) return null
  if (!TIMETABLE_SLOTS.includes(slotRaw as TimetableSlot)) return null
  return {
    weekday: weekday as TimetableWeekday,
    slot: slotRaw as TimetableSlot,
  }
}

export function normalizeTimetableTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim().slice(0, TIMETABLE_TITLE_MAX)
}

export function isTimetableTone(value: unknown): value is TimetableTone {
  return (
    typeof value === 'string' &&
    (TIMETABLE_TONES as readonly string[]).includes(value)
  )
}

export function sanitizeTimetableCell(
  value: Partial<TimetableCell> | null | undefined,
): TimetableCell | null {
  if (!value) return null
  const title = normalizeTimetableTitle(value.title ?? '')
  const tone = isTimetableTone(value.tone) ? value.tone : undefined
  if (!title && !tone) return null
  return tone ? { title, tone } : { title }
}

export function upsertTimetableCell(
  timetable: Record<string, TimetableCell>,
  weekday: TimetableWeekday,
  slot: TimetableSlot,
  value: Partial<TimetableCell>,
): Record<string, TimetableCell> {
  const next = { ...timetable }
  const key = timetableCellKey(weekday, slot)
  const sanitized = sanitizeTimetableCell(value)
  if (!sanitized) {
    delete next[key]
    return next
  }
  next[key] = sanitized
  return next
}

export function clearTimetableCell(
  timetable: Record<string, TimetableCell>,
  weekday: TimetableWeekday,
  slot: TimetableSlot,
): Record<string, TimetableCell> {
  const key = timetableCellKey(weekday, slot)
  if (!(key in timetable)) return timetable
  const next = { ...timetable }
  delete next[key]
  return next
}

export function markedTimetableCount(
  timetable: Record<string, TimetableCell>,
): number {
  return Object.keys(timetable).length
}

export function cellsForWeekday(
  timetable: Record<string, TimetableCell>,
  weekday: TimetableWeekday,
): Array<{ slot: TimetableSlot; cell?: TimetableCell }> {
  return TIMETABLE_SLOTS.map((slot) => ({
    slot,
    cell: timetable[timetableCellKey(weekday, slot)],
  }))
}

/** JS Date#getDay() already matches TimetableWeekday (0=Sun … 6=Sat). */
export function weekdayFromDate(date = new Date()): TimetableWeekday {
  return date.getDay() as TimetableWeekday
}

export function timetableCellLabel(
  weekday: TimetableWeekday,
  slot: TimetableSlot,
): string {
  return `周${TIMETABLE_WEEKDAY_LABELS[weekday]}${TIMETABLE_SLOT_LABELS[slot]}`
}
