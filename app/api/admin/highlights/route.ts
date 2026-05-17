import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Highlight } from '@/models/Highlight'
import { uploadImage, deleteAsset } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const highlights = await Highlight.find().sort({ order: 1, createdAt: -1 })
    return NextResponse.json(highlights)
  } catch (err) {
    console.error('[GET /api/admin/highlights]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const formData  = await req.formData()
    const title     = formData.get('title') as string | null
    const slug      = formData.get('slug') as string | null
    const coverFile = formData.get('cover') as File | null

    if (!title || !slug || !coverFile) {
      return NextResponse.json({ error: 'title, slug and cover are required' }, { status: 400 })
    }

    // Upload the cover image to Cloudinary
    const buffer = Buffer.from(await coverFile.arrayBuffer())
    const cover  = await uploadImage(buffer, 'wedding/highlights/covers')

    const highlight = await Highlight.create({
      title,
      slug,
      cover: {
        publicId:     cover.publicId,
        url:          cover.url,
        thumbnailUrl: cover.thumbnailUrl,
        blurDataUrl:  cover.blurDataUrl,
      },
      items: [],
    })

    return NextResponse.json(highlight, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/admin/highlights]', err)
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
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
    const h = await Highlight.findByIdAndDelete(id)

    if (h) {
      // Delete cover from Cloudinary
      await deleteAsset(h.cover.publicId)
      // Delete all photo items from Cloudinary
      const photoItems = h.items.filter((item: any) => item.type === 'photo' && item.publicId)
      await Promise.all(photoItems.map((item: any) => deleteAsset(item.publicId)))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/highlights]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}