import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  betaDataExport,
  grantBetaAccess,
  loadBetaEvents,
  loadBetaPreferences,
  setAnalyticsEnabled,
  trackBetaEvent,
} from '../beta'
import { memoryStorage } from './fixtures'

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
})

describe('closed beta privacy', () => {
  it('keeps anonymous event collection off by default', () => {
    expect(loadBetaPreferences().analyticsEnabled).toBe(false)
    trackBetaEvent('first_task_completed')
    expect(loadBetaEvents()).toEqual([])
  })

  it('records only the declared event shape after explicit consent', () => {
    setAnalyticsEnabled(true)
    trackBetaEvent('room_purchased', 'study')
    expect(loadBetaEvents()).toHaveLength(1)
    expect(loadBetaEvents()[0]).toMatchObject({
      name: 'room_purchased',
      detail: 'study',
      day: 0,
    })
    expect(betaDataExport().privacy).toContain('不包含待办标题')
  })

  it('starts the return-day clock when consent is enabled, not at invite view', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T08:00:00.000Z'))
    loadBetaPreferences()
    vi.setSystemTime(new Date('2026-07-10T08:00:00.000Z'))
    const enabled = setAnalyticsEnabled(true)
    expect(enabled.firstSeenAt).toBe('2026-07-10T08:00:00.000Z')
    vi.useRealTimers()
  })

  it('clears local events immediately when consent is withdrawn', () => {
    setAnalyticsEnabled(true)
    trackBetaEvent('app_open')
    expect(loadBetaEvents()).toHaveLength(1)
    setAnalyticsEnabled(false)
    expect(loadBetaEvents()).toEqual([])
  })

  it('accepts the documented beta code without creating an account', () => {
    expect(grantBetaAccess('wrong')).toBe(false)
    expect(grantBetaAccess('shangu-09')).toBe(true)
    expect(loadBetaPreferences().accessGranted).toBe(true)
  })
})
