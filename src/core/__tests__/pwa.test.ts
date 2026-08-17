import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('offline application shell', () => {
  const worker = readFileSync(resolve('public/sw.js'), 'utf8')
  const manifest = JSON.parse(
    readFileSync(resolve('public/manifest.webmanifest'), 'utf8'),
  )

  it('uses relative scope and installable icons for GitHub Pages', () => {
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: '192x192' }),
        expect.objectContaining({ sizes: '512x512' }),
      ]),
    )
  })

  it('caches the shell and visited art while retaining prompted updates', () => {
    expect(worker).toContain("const CACHE_PREFIX = 'productivity-valley-'")
    expect(worker).toContain('const CACHE = `${CACHE_PREFIX}v0.9.4`')
    expect(worker).toContain('key.startsWith(CACHE_PREFIX)')
    expect(worker).toContain('const MAX_CACHE_ENTRIES = 120')
    expect(worker).toContain("url.pathname.includes('/art/')")
    expect(worker).toContain("event.data?.type === 'SKIP_WAITING'")
    expect(worker).toContain("request.mode === 'navigate'")
    expect(worker).toContain('function networkFirst')
  })
})
