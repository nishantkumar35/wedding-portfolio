import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Photo } from '@/models/Photo'
import { uploadImage, deleteAsset } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_LIMIT     = 50               // max records per page

export async function GET(req: Request) {
  try {
    // Protected — only admin can browse the full photo library
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const albumId = searchParams.get('albumId')
    const page    = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit   = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip    = (page - 1) * limit

    await connectDB()
    const query = albumId ? { albumId } : {}

    const [photos, total] = await Promise.all([
      Photo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Photo.countDocuments(query),
    ])

    return NextResponse.json({ photos, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[GET /api/admin/photos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const albumId  = formData.get('albumId') as string | null
    const caption  = (formData.get('caption') as string) ?? ''

    if (!file || !albumId) {
      return NextResponse.json({ error: 'file and albumId are required' }, { status: 400 })
    }

    // ── File size check (10 MB) ───────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 }
      )
    }

    // ── All image types allowed ───────────────────────────────────────────
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are accepted.' },
        { status: 415 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImage(buffer, `wedding/albums/${albumId}`)

    await connectDB()
    const photo = await Photo.create({ albumId, caption, ...result })
    return NextResponse.json(photo, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/photos]', err)
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
    const photo = await Photo.findByIdAndDelete(id)
    if (photo) await deleteAsset(photo.publicId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/photos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
