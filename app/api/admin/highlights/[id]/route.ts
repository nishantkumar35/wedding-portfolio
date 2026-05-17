import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Highlight } from '@/models/Highlight'
import { uploadImage, deleteAsset } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// Add an item to a highlight
export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()
    const formData = await req.formData()
    const type     = formData.get('type') as 'photo' | 'youtube' | null
    const caption  = (formData.get('caption') as string) ?? ''

    if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })

    let newItem: any

    if (type === 'photo') {
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'file is required for photo type' }, { status: 400 })
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadImage(buffer, `wedding/highlights/${id}`)
      newItem = { type: 'photo', caption, ...result }
    } else {
      const youtubeId    = formData.get('youtubeId') as string | null
      const youtubeTitle = (formData.get('youtubeTitle') as string) ?? ''
      if (!youtubeId) return NextResponse.json({ error: 'youtubeId is required for youtube type' }, { status: 400 })
      newItem = { type: 'youtube', youtubeId, youtubeTitle, caption }
    }

    const highlight = await Highlight.findByIdAndUpdate(
      id,
      { $push: { items: newItem } },
      { new: true }
    )

    if (!highlight) return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    return NextResponse.json(highlight, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/highlights/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Remove one item from a highlight
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { itemId } = await req.json()
    const { id } = await params
    if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
    await connectDB()

    const highlight = await Highlight.findById(id)
    if (!highlight) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const item = highlight.items.id(itemId)
    if (item?.type === 'photo' && item.publicId) {
      await deleteAsset(item.publicId)
    }

    await Highlight.findByIdAndUpdate(id, {
      $pull: { items: { _id: itemId } }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/highlights/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}