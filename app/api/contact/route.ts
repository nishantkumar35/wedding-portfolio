import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ContactInquiry } from '@/models/ContactInquiry'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, weddingDate, location, package: pkg, message } = body

    if (!firstName || !email) {
      return NextResponse.json({ error: 'First name and email are required' }, { status: 400 })
    }

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
