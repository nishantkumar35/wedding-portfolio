import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ContactInquiry } from '@/models/ContactInquiry'
import { contactLimiter, getClientIP } from '@/lib/ratelimit'
import { ContactSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIP(req)
  const { success, limit, remaining, reset } = await contactLimiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  // ── Input validation ──────────────────────────────────────────────────────
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, weddingDate, location, package: pkg, message } = parsed.data

    await connectDB()
    const inquiry = await ContactInquiry.create({
      firstName,
      lastName,
      email,
      phone,
      weddingDate,
      location,
      package: pkg,
      message,
    })

    return NextResponse.json({ success: true, id: inquiry._id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

