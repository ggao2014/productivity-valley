import type { TaskCategory, TimetableCell, TimetableHour, TimetableWeekday } from './types'

/** Inclusive hour range for the preview timetable (8:00 through 21:00). */
export const TIMETABLE_HOUR_START = 8
export const TIMETABLE_HOUR_END = 21

export const TIMETABLE_HOURS: TimetableHour[] = Array.from(
  { length: TIMETABLE_HOUR_END - TIMETABLE_HOUR_START + 1 },
  (_, index) => TIMETABLE_HOUR_START + index,
)

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

export const TIMETABLE_CATEGORIES: TaskCategory[] = [
  'work',
  'study',
  'life',
  'health',
  'errand',
]

export const TIMETABLE_TITLE_MAX = 24

export function isTimetableHour(value: unknown): value is TimetableHour {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= TIMETABLE_HOUR_START &&
    value <= TIMETABLE_HOUR_END
  )
}

export function isTimetableCategory(value: unknown): value is TaskCategory {
  return (
    typeof value === 'string' &&
    (TIMETABLE_CATEGORIES as readonly string[]).includes(value)
  )
}

export function formatTimetableHour(hour: TimetableHour): string {
  return `${hour}:00`
}

export function timetableCellKey(
  weekday: TimetableWeekday,
  hour: TimetableHour,
): string {
  return `${weekday}:${hour}`
}

export function parseTimetableCellKey(
  key: string,
): { weekday: TimetableWeekday; hour: TimetableHour } | null {
  const [weekdayRaw, hourRaw] = key.split(':')
  const weekday = Number(weekdayRaw)
  const hour = Number(hourRaw)
  if (![0, 1, 2, 3, 4, 5, 6].includes(weekday)) return null
  if (!isTimetableHour(hour)) return null
  return {
    weekday: weekday as TimetableWeekday,
    hour,
  }
}

export function normalizeTimetableTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim().slice(0, TIMETABLE_TITLE_MAX)
}

export function sanitizeTimetableCell(
  value: Partial<TimetableCell> | null | undefined,
): TimetableCell | null {
  if (!value) return null
  const title = normalizeTimetableTitle(value.title ?? '')
  const category = isTimetableCategory(value.category)
    ? value.category
    : undefined
  if (!title && !category) return null
  return category ? { title, category } : { title }
}

export function sanitizeTimetable(
  timetable: Record<string, TimetableCell> | undefined,
): Record<string, TimetableCell> {
  if (!timetable) return {}
  const next: Record<string, TimetableCell> = {}
  for (const [key, value] of Object.entries(timetable)) {
    if (!parseTimetableCellKey(key)) continue
    const cell = sanitizeTimetableCell(value)
    if (cell) next[key] = cell
  }
  return next
}

export function upsertTimetableCell(
  timetable: Record<string, TimetableCell>,
  weekday: TimetableWeekday,
  hour: TimetableHour,
  value: Partial<TimetableCell>,
): Record<string, TimetableCell> {
  const next = { ...timetable }
  const key = timetableCellKey(weekday, hour)
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
  hour: TimetableHour,
): Record<string, TimetableCell> {
  const key = timetableCellKey(weekday, hour)
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
): Array<{ hour: TimetableHour; cell?: TimetableCell }> {
  return TIMETABLE_HOURS.map((hour) => ({
    hour,
    cell: timetable[timetableCellKey(weekday, hour)],
  }))
}

/** JS Date#getDay() already matches TimetableWeekday (0=Sun … 6=Sat). */
export function weekdayFromDate(date = new Date()): TimetableWeekday {
  return date.getDay() as TimetableWeekday
}

export function hourFromDate(date = new Date()): TimetableHour {
  const hour = date.getHours()
  if (hour < TIMETABLE_HOUR_START) return TIMETABLE_HOUR_START
  if (hour > TIMETABLE_HOUR_END) return TIMETABLE_HOUR_END
  return hour
}

export function timetableCellLabel(
  weekday: TimetableWeekday,
  hour: TimetableHour,
): string {
  return `周${TIMETABLE_WEEKDAY_LABELS[weekday]} ${formatTimetableHour(hour)}`
}
