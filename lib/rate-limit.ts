type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as unknown as {
  neuralbriefRateLimits?: Map<string, RateLimitEntry>
}

const store = globalForRateLimit.neuralbriefRateLimits ?? new Map<string, RateLimitEntry>()
globalForRateLimit.neuralbriefRateLimits = store

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt }
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown"

  return req.headers.get("x-real-ip") || "unknown"
}
