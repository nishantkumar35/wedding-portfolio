'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FolderOpen, Images, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Album {
  _id: string
  name: string
  slug?: string
  coverUrl?: string
  photoCount?: number
  thumbnailUrl?: string
  blurDataUrl?: string
}

interface AlbumShowcaseProps {
  albums: Album[]
}

const ALBUMS_PER_PAGE = 6

/* ─────────────────────────────────────────
   Single Album Card — premium glassmorphism
───────────────────────────────────────── */
function AlbumCard({ album, onClick }: { album: Album; onClick: () => void }) {
  const cover = album.coverUrl || album.thumbnailUrl || null

  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden w-full aspect-[4/3] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
      aria-label={`Open album: ${album.name}`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {cover ? (
          <Image
            src={cover}
            alt={album.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder={album.blurDataUrl ? 'blur' : 'empty'}
            blurDataURL={album.blurDataUrl}
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-[#2D3539]">
            {[0, 1, 2, 3].map(n => (
              <div key={n} className="bg-[#3A4448] flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-white/10" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 group-hover:from-black/90 group-hover:via-black/35 transition-all duration-500" />

      {/* Shine sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)' }}
      />

      {/* Photo count badge */}
      {album.photoCount !== undefined && album.photoCount > 0 && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 z-10">
          <Images className="w-3 h-3 text-white/70" />
          <span className="text-white/85 text-[10px] font-semibold tabular-nums tracking-wide">
            {album.photoCount}
          </span>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-white text-lg font-bold leading-snug truncate group-hover:text-white/95 transition-colors">
              {album.name}
            </h3>
            <p className="text-white/45 text-[11px] mt-1 tracking-widest uppercase font-medium group-hover:text-white/65 transition-colors">
              View Album
            </p>
          </div>
          {/* Arrow button */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#333C43] transition-colors duration-300" />
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────
   Pagination Controls
───────────────────────────────────────── */
function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-5 mt-10">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-[#333C43]/30 text-[#333C43] hover:bg-[#333C43] hover:text-white hover:border-[#333C43] disabled:opacity-25 disabled:pointer-events-none transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {/* Page dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i + 1 === currentPage
                ? 'w-6 h-2.5 bg-[#333C43]'
                : 'w-2.5 h-2.5 bg-[#333C43]/20'
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-[#333C43]/30 text-[#333C43] hover:bg-[#333C43] hover:text-white hover:border-[#333C43] disabled:opacity-25 disabled:pointer-events-none transition-all duration-200"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main AlbumShowcase
───────────────────────────────────────── */
export function AlbumShowcase({ albums }: AlbumShowcaseProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(albums.length / ALBUMS_PER_PAGE))
  const pagedAlbums = albums.slice((page - 1) * ALBUMS_PER_PAGE, page * ALBUMS_PER_PAGE)

  const handleAlbumClick = useCallback(
    (albumId: string) => {
      router.push(`/gallery?album=${albumId}`)
    },
    [router],
  )

  /* ── Empty state ── */
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#333C43]/8 flex items-center justify-center">
          <FolderOpen className="w-7 h-7 text-[#333C43]/25" />
        </div>
        <p className="text-[#333C43]/40 text-sm font-light tracking-wide">No albums yet</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {pagedAlbums.map((album) => (
          <AlbumCard
            key={album._id}
            album={album}
            onClick={() => handleAlbumClick(album._id)}
          />
        ))}
      </div>

      {/* Pagination — only when more than one page */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      )}
    </div>
  )
}
