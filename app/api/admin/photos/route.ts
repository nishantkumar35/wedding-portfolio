import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Photo } from '@/models/Photo'
import { uploadImage, deleteAsset } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const albumId = searchParams.get('albumId')
    await connectDB()
    const query = albumId ? { albumId } : {}
    const photos = await Photo.find(query).sort({ createdAt: -1 })
    return NextResponse.json(photos)
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
    const file    = formData.get('file') as File | null
    const albumId = formData.get('albumId') as string | null
    const caption = (formData.get('caption') as string) ?? ''

    if (!file || !albumId) {
      return NextResponse.json({ error: 'file and albumId are required' }, { status: 400 })
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