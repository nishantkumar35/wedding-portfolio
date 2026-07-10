import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ContactInquiry } from '@/models/ContactInquiry'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InquiryStatusSchema } from '@/lib/validators'

const MAX_LIMIT = 100

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'new' | 'read' | 'replied' | null (all)
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit  = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip   = (page - 1) * limit

    await connectDB()
    const query = status ? { status } : {}
    const [inquiries, total, countNew, countRead, countReplied] = await Promise.all([
      ContactInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactInquiry.countDocuments(query),
      ContactInquiry.countDocuments({ status: 'new' }),
      ContactInquiry.countDocuments({ status: 'read' }),
      ContactInquiry.countDocuments({ status: 'replied' }),
    ])

    return NextResponse.json({
      inquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      counts: { new: countNew, read: countRead, replied: countReplied },
    })
  } catch (err) {
    console.error('[GET /api/admin/inquiries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = InquiryStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { id, status } = parsed.data

    await connectDB()
    const inquiry = await ContactInquiry.findByIdAndUpdate(id, { status }, { new: true })
    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    return NextResponse.json({ success: true, inquiry })
  } catch (err) {
    console.error('[PATCH /api/admin/inquiries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    await connectDB()
    await ContactInquiry.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/inquiries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

