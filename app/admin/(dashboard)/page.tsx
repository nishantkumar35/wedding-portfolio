import { connectDB } from '@/lib/db'
import { Album } from '@/models/Album'
import { Photo } from '@/models/Photo'
import { Highlight } from '@/models/Highlight'
import { Video } from '@/models/Video'
import { ContactInquiry } from '@/models/ContactInquiry'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminApp } from '@/components/admin/AdminApp'

async function getInitialData() {
  await connectDB()
  const [albums, photos, highlights, videos, recentAlbums, inquiries, newInquiries] = await Promise.all([
    Album.countDocuments(),
    Photo.countDocuments(),
    Highlight.countDocuments(),
    Video.countDocuments(),
    Album.find().sort({ createdAt: -1 }).limit(5).lean(),
    ContactInquiry.countDocuments(),
    ContactInquiry.countDocuments({ status: 'new' }),
  ])
  return {
    stats: { albums, photos, highlights, videos, inquiries, newInquiries },
    recentAlbums: JSON.parse(JSON.stringify(recentAlbums))
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const { stats, recentAlbums } = await getInitialData()

  return (
    <AdminApp 
      session={session} 
      initialStats={stats} 
      initialRecentAlbums={recentAlbums} 
    />
  )
}
