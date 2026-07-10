import { Suspense } from 'react'
import { connectDB } from '@/lib/db'
import { Photo } from '@/models/Photo'
import { Video } from '@/models/Video'
import { Highlight } from '@/models/Highlight'
import { Album } from '@/models/Album'
import { GalleryApp } from '@/components/GalleryApp'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wedding Photography & Videography Gallery | Aarsh Wedding Videography',
  description: 'Explore our portfolio of cinematic wedding films, pre-wedding shoots, and beautiful wedding photography by Aarsh Wedding Videography in Begusarai, Bihar.',
}

export const revalidate = 60

async function getGalleryData() {
  try {
    await connectDB()
    const [photos, videos, highlights, albums] = await Promise.all([
      Photo.find().sort({ createdAt: -1 }).lean(),
      Video.find().sort({ order: 1, createdAt: -1 }).lean(),
      Highlight.find().sort({ order: 1, createdAt: -1 }).lean(),
      Album.find().sort({ createdAt: -1 }).lean(),
    ])

    // Group photos by album
    const albumsWithPhotos = albums.map((album: any) => ({
      ...album,
      photos: photos.filter((p: any) => String(p.albumId) === String(album._id)),
    }))

    return {
      photos: JSON.parse(JSON.stringify(photos)),
      videos: JSON.parse(JSON.stringify(videos)),
      highlights: JSON.parse(JSON.stringify(highlights)),
      albums: JSON.parse(JSON.stringify(albumsWithPhotos)),
    }
  } catch (error) {
    console.error('Failed to fetch gallery data:', error)
    return { photos: [], videos: [], highlights: [], albums: [] }
  }
}

export default async function GalleryPage() {
  const data = await getGalleryData()

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Link href="/" className="block py-4 px-6 bg-[#333C43] text-white text-sm uppercase tracking-wide font-medium" aria-label="Back to Aarsh Wedding Videography Home">Back to Home</Link>
      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h1 className="sr-only">Aarsh Wedding Photography & Videography Portfolio Gallery</h1>
          <Suspense fallback={
            <div className="flex justify-center py-32 text-[#333C43]/40 tracking-[0.3em] text-xs uppercase animate-pulse">
              Loading Gallery...
            </div>
          }>
            <GalleryApp
              photos={data.photos}
              videos={data.videos}
              highlights={data.highlights}
              albums={data.albums}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
