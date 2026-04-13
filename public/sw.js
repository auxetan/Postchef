const CACHE = 'postchef-v2'
const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  e.respondWith((async () => {
    try {
      const res = await fetch(e.request)
      if (res.ok) {
        const cache = await caches.open(CACHE)
        cache.put(e.request, res.clone())
      }
      return res
    } catch (error) {
      const cached = await caches.match(e.request)
      if (cached) return cached
      throw error
    }
  })())
})
