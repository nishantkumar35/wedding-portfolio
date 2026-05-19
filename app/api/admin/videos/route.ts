import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Video } from '@/models/Video'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10') // max 10 videos
    const skip = (page - 1) * limit

    await connectDB()
    const [videos, total] = await Promise.all([
      Video.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Video.countDocuments()
    ])
    
    return NextResponse.json({ videos, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[GET /api/admin/videos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    if (!body.youtubeId || !body.title) {
      return NextResponse.json({ error: 'youtubeId and title are required' }, { status: 400 })
    }
    const video = await Video.create(body)
    return NextResponse.json(video, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/videos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id, ...update } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const video = await Video.findByIdAndUpdate(id, update, { new: true })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    return NextResponse.json(video)
  } catch (err) {
    console.error('[PATCH /api/admin/videos]', err)
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
    const video = await Video.findByIdAndDelete(id)
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/videos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}