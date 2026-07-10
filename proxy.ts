import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { generalLimiter, getClientIP } from '@/lib/ratelimit'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Rate limit all /api/* routes ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(req)
    const { success, limit, remaining, reset } = await generalLimiter.limit(ip)

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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
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

