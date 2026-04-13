const store = globalThis.__postchefRateLimitStore || new Map()

if (!globalThis.__postchefRateLimitStore) {
  globalThis.__postchefRateLimitStore = store
}

export function checkRateLimit({ key, limit, windowMs }) {
  const now = Date.now()
  const previous = store.get(key) || []
  const fresh = previous.filter((timestamp) => now - timestamp < windowMs)

  if (fresh.length >= limit) {
    const retryAfterMs = windowMs - (now - fresh[0])
    store.set(key, fresh)
    return { allowed: false, retryAfterMs }
  }

  fresh.push(now)
  store.set(key, fresh)

  return { allowed: true, retryAfterMs: 0 }
}
