import Redis from 'ioredis'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Standard Redis client via ioredis
// ---------------------------------------------------------------------------
// We connect to Render or any standard Redis server using REDIS_URL
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
})

// ---------------------------------------------------------------------------
// Fixed Window Rate Limiter
// ---------------------------------------------------------------------------
class RateLimiter {
  constructor(private prefix: string, private limitCount: number, private windowSeconds: number) {}

  async limit(identifier: string) {
    const currentWindow = Math.floor(Date.now() / (this.windowSeconds * 1000))
    const key = `${this.prefix}:${identifier}:${currentWindow}`
    
    // Increment the request count
    const current = await redis.incr(key)
    
    // Set expiry on the first request of the window (add a 2s buffer to be safe)
    if (current === 1) {
      await redis.expire(key, this.windowSeconds + 2)
    }

    const reset = (currentWindow + 1) * this.windowSeconds * 1000
    const remaining = Math.max(0, this.limitCount - current)
    const success = current <= this.limitCount

    return { success, limit: this.limitCount, remaining, reset }
  }
}

// ---------------------------------------------------------------------------
// Rate limiters
// ---------------------------------------------------------------------------

/** Contact form – 5 submissions per 60 minutes */
export const contactLimiter = new RateLimiter('rl:contact', 5, 60 * 60)

/** NextAuth login – 10 attempts per 15 minutes */
export const authLimiter = new RateLimiter('rl:auth', 10, 15 * 60)

/** General API calls – 60 requests per 60 seconds */
export const generalLimiter = new RateLimiter('rl:general', 60, 60)

// ---------------------------------------------------------------------------
// Helper: extract real client IP (works behind Vercel / Nginx proxies)
// ---------------------------------------------------------------------------
export function getClientIP(req: NextRequest | Request): string {
  const forwarded =
    (req.headers as Headers).get('x-forwarded-for') ??
    (req.headers as Headers).get('x-real-ip')

  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first
    return forwarded.split(',')[0].trim()
  }

  return '127.0.0.1'
}
