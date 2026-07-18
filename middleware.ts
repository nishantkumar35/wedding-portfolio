/**
 * middleware.ts — runs on the Edge runtime (always, no exceptions).
 *
 * ioredis / any Node.js-only package must NEVER be imported here because the
 * Edge runtime has no `net` module and cannot open raw TCP sockets.
 *
 * Rate limiting here uses a lightweight in-memory sliding-window counter that
 * is intentionally simple: it resets per Edge instance, which is fine as a
 * first line of defence.  Precise, persistent rate limiting for sensitive
 * endpoints (contact form, auth) is enforced inside the Node.js API route
 * handlers using ioredis (see app/lib/ratelimit.ts).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ---------------------------------------------------------------------------
// Edge-safe in-memory rate limiter
// ---------------------------------------------------------------------------
interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

const RATE_LIMIT = 60          // requests
const WINDOW_MS  = 60 * 1000   // 60 seconds

function edgeRateLimit(ip: string): {
  success: boolean
  limit: number
  remaining: number
  reset: number
} {
  const now    = Date.now()
  const entry  = store.get(ip)

  if (!entry || now >= entry.resetAt) {
    // New window
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { success: true, limit: RATE_LIMIT, remaining: RATE_LIMIT - 1, reset: now + WINDOW_MS }
  }

  entry.count += 1
  const remaining = Math.max(0, RATE_LIMIT - entry.count)
  const success   = entry.count <= RATE_LIMIT

  return { success, limit: RATE_LIMIT, remaining, reset: entry.resetAt }
}

function getClientIP(req: NextRequest): string {
  const forwarded =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Rate limit all /api/* routes ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(req)
    const { success, limit, remaining, reset } = edgeRateLimit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit':     String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset':     String(reset),
            'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      )
    }

    const res = NextResponse.next()
    res.headers.set('X-RateLimit-Limit',     String(limit))
    res.headers.set('X-RateLimit-Remaining', String(remaining))
    res.headers.set('X-RateLimit-Reset',     String(reset))
    return res
  }

  // ── 2. Auth guard for /admin/* (except login page) ────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const secret = process.env.NEXTAUTH_SECRET

    if (!secret) {
      console.error('NEXTAUTH_SECRET missing at runtime — redirecting to login')
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    const token = await getToken({ req, secret })

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
