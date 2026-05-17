import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Album } from '@/models/Album'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const albums = await Album.find().sort({ createdAt: -1 })
    return NextResponse.json(albums)
  } catch (err) {
    console.error('[GET /api/admin/album]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { name, slug } = await req.json()
    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }
    const album = await Album.create({ name, slug })
    return NextResponse.json(album, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/admin/album]', err)
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id, name, coverUrl } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const update: Record<string, string> = {}
    if (name) update.name = name
    if (coverUrl) update.coverUrl = coverUrl

    const album = await Album.findByIdAndUpdate(id, update, { new: true })
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    return NextResponse.json(album)
  } catch (err) {
    console.error('[PATCH /api/admin/album]', err)
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
    const album = await Album.findByIdAndDelete(id)
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/album]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}