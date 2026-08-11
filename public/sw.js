const CACHE_PREFIX = 'productivity-valley-'
const CACHE = `${CACHE_PREFIX}v0.9.1`
const SHELL = ['./', './manifest.webmanifest', './favicon.svg', './pwa-192.png']
const MAX_CACHE_ENTRIES = 120

async function remember(request, response) {
  const cache = await caches.open(CACHE)
  await cache.put(request, response)
  const keys = await cache.keys()
  const excess = keys.length - MAX_CACHE_ENTRIES
  if (excess > 0) {
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)))
  }
}

function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone()
        void remember(request, copy)
      }
      return response
    })
    .catch(async () => {
      const cached = await caches.match(request)
      if (cached) return cached
      if (fallbackUrl) return caches.match(fallbackUrl)
      return Response.error()
    })
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './'))
    return
  }

  // Art stays cache-first; app shell/scripts must prefer network so deploys land.
  if (url.pathname.includes('/art/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              void remember(request, copy)
            }
            return response
          }),
      ),
    )
    return
  }

  event.respondWith(networkFirst(request))
})
