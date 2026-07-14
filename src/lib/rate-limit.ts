import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'

type RateLimitOptions = {
  max: number
  windowMs: number
}

const tokenCache = new LRUCache<string, number>({
  max: 500,
  ttl: 60000,
})

export function rateLimit(req: NextRequest, options: RateLimitOptions) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const tokenCount = tokenCache.get(ip) || 0

  if (tokenCount >= options.max) {
    return { success: false, limit: options.max, remaining: 0 }
  }

  tokenCache.set(ip, tokenCount + 1, { ttl: options.windowMs })

  return {
    success: true,
    limit: options.max,
    remaining: options.max - (tokenCount + 1),
  }
}
