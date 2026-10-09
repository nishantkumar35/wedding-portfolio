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
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Wedding Photography & Videography Gallery | Aarsh Wedding Videography',
  description:
    'Browse our portfolio of cinematic wedding films, pre-wedding shoots, candid wedding photography, and drone videography by Aarsh Wedding Videography – the best wedding photographer & videographer in Begusarai, Bihar.',
  keywords: [
    'wedding photography gallery Begusarai',
    'wedding videography portfolio Bihar',
    'best wedding photographer in Begusarai',
    'cinematic wedding films Begusarai',
    'pre wedding shoot gallery Bihar',
    'candid wedding photographer Begusarai',
    'drone wedding videography Bihar',
    'wedding photo album Begusarai',
    'wedding highlights Begusarai',
    'Aarsh Wedding Videography portfolio',
  ],
  openGraph: {
    type: 'website',
    title: 'Wedding Photography & Videography Gallery | Aarsh Wedding Videography',
    description:
      'Browse our portfolio of cinematic wedding films, pre-wedding shoots, candid wedding photography, and drone videography by Aarsh Wedding Videography in Begusarai, Bihar.',
    images: [
      {
        url: '/assets/hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'Wedding Photography & Videography Gallery – Aarsh Wedding Videography Begusarai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding Photography & Videography Gallery | Aarsh Wedding Videography',
    description:
      'Browse our portfolio of cinematic wedding films, pre-wedding shoots, candid wedding photography, and drone videography by Aarsh Wedding Videography in Begusarai, Bihar.',
    images: ['/assets/hero.jpeg'],
  },
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

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>
}) {
  const data = await getGalleryData()
  const { album: initialAlbumId } = await searchParams

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Back to Home button */}
      <div className="px-6 pt-5 pb-2">
        <Link
          href="/"
          aria-label="Back to Aarsh Wedding Videography Home"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#333C43]/20 text-[#333C43] text-xs font-semibold tracking-widest uppercase bg-white hover:bg-[#333C43] hover:text-white hover:border-[#333C43] shadow-sm transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>
      <main className="pt-6 pb-20">
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
              initialAlbumId={initialAlbumId}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
