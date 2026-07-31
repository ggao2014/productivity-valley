export type BetaEventName =
  | 'app_open'
  | 'first_task_completed'
  | 'core_loop_completed'
  | 'friendship_stage_unlocked'
  | 'romance_stage_unlocked'
  | 'room_purchased'
  | 'return_day_1'
  | 'return_day_7'

export interface BetaEvent {
  name: BetaEventName
  at: string
  day: number
  detail?: string
}

export interface BetaPreferences {
  accessGranted: boolean
  analyticsEnabled: boolean
  firstSeenAt: string
}

const PREFS_KEY = 'productivity-valley-beta-prefs-v1'
const EVENTS_KEY = 'productivity-valley-beta-events-v1'
const SAVE_KEY = 'productivity-valley-v1'
const DEFAULT_INVITE_CODE = 'SHANGU-09'
const MAX_EVENTS = 250

function storageAvailable() {
  return typeof localStorage !== 'undefined'
}

function freshPreferences(): BetaPreferences {
  return {
    accessGranted: false,
    analyticsEnabled: false,
    firstSeenAt: new Date().toISOString(),
  }
}

export function loadBetaPreferences(): BetaPreferences {
  if (!storageAvailable()) return freshPreferences()
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) {
      const fresh = freshPreferences()
      localStorage.setItem(PREFS_KEY, JSON.stringify(fresh))
      return fresh
    }
    const parsed = JSON.parse(raw) as Partial<BetaPreferences>
    return {
      accessGranted: parsed.accessGranted === true,
      analyticsEnabled: parsed.analyticsEnabled === true,
      firstSeenAt:
        typeof parsed.firstSeenAt === 'string'
          ? parsed.firstSeenAt
          : new Date().toISOString(),
    }
  } catch {
    return freshPreferences()
  }
}

export function saveBetaPreferences(
  preferences: BetaPreferences,
): BetaPreferences {
  if (storageAvailable()) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences))
  }
  return preferences
}

export function hasExistingProgress(): boolean {
  return storageAvailable() && Boolean(localStorage.getItem(SAVE_KEY))
}

export function inviteCodeIsValid(code: string): boolean {
  const expected = (import.meta.env.VITE_BETA_CODE || DEFAULT_INVITE_CODE)
    .trim()
    .toUpperCase()
  return code.trim().toUpperCase() === expected
}

export function grantBetaAccess(code: string): boolean {
  if (!inviteCodeIsValid(code)) return false
  const current = loadBetaPreferences()
  saveBetaPreferences({ ...current, accessGranted: true })
  return true
}

export function setAnalyticsEnabled(enabled: boolean): BetaPreferences {
  const current = loadBetaPreferences()
  const next = {
    ...current,
    analyticsEnabled: enabled,
    firstSeenAt:
      enabled && !current.analyticsEnabled
        ? new Date().toISOString()
        : current.firstSeenAt,
  }
  saveBetaPreferences(next)
  if (!enabled && storageAvailable()) localStorage.removeItem(EVENTS_KEY)
  return next
}

function dayDifference(from: string, to = new Date()): number {
  const start = new Date(from)
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.max(0, Math.floor((b - a) / 86_400_000))
}

export function loadBetaEvents(): BetaEvent[] {
  if (!storageAvailable()) return []
  try {
    const value: unknown = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter(
      (event): event is BetaEvent =>
        typeof event === 'object' &&
        event !== null &&
        typeof (event as BetaEvent).name === 'string' &&
        typeof (event as BetaEvent).at === 'string' &&
        typeof (event as BetaEvent).day === 'number',
    )
  } catch {
    return []
  }
}

export function trackBetaEvent(
  name: BetaEventName,
  detail?: string,
  once = false,
): void {
  const preferences = loadBetaPreferences()
  if (!preferences.analyticsEnabled || !storageAvailable()) return
  const events = loadBetaEvents()
  if (
    once &&
    events.some(
      (event) =>
        event.name === name && (detail === undefined || event.detail === detail),
    )
  ) return
  const safeDetail = detail?.slice(0, 48)
  events.push({
    name,
    at: new Date().toISOString(),
    day: dayDifference(preferences.firstSeenAt),
    ...(safeDetail ? { detail: safeDetail } : {}),
  })
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

export function recordOpenAndReturns(now = new Date()): void {
  const preferences = loadBetaPreferences()
  if (!preferences.analyticsEnabled) return
  trackBetaEvent('app_open')
  const day = dayDifference(preferences.firstSeenAt, now)
  if (day >= 1) trackBetaEvent('return_day_1', undefined, true)
  if (day >= 7) trackBetaEvent('return_day_7', undefined, true)
}

export function betaDataExport() {
  return {
    format: 'productivity-valley-beta-data-v1',
    exportedAt: new Date().toISOString(),
    privacy:
      '不包含待办标题、角色对话内容、存档、姓名、邮箱、设备标识或网络地址。',
    events: loadBetaEvents(),
  }
}
