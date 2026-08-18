'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FolderOpen, Images } from 'lucide-react'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Album {
  _id: string
  name: string
  slug?: string
  coverUrl?: string
  photoCount?: number
  // passed in from page — first photo thumb
  thumbnailUrl?: string
  blurDataUrl?: string
}

interface AlbumShowcaseProps {
  albums: Album[]
}

/* ─────────────────────────────────────────
   Single Album Card
───────────────────────────────────────── */
function AlbumCard({ album, onClick }: { album: Album; onClick: () => void }) {
  const cover = album.coverUrl || album.thumbnailUrl || null

  return (
    <button
      onClick={onClick}
      className="
        group relative flex-shrink-0
        w-[220px] sm:w-[260px] md:w-[300px]
        rounded-2xl overflow-hidden
        bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.18)]
        hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.28)]
        hover:-translate-y-2 transition-all duration-500
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8697A0] focus-visible:ring-offset-2
        cursor-pointer select-none
      "
      aria-label={`Open album: ${album.name}`}
    >
      {/* Folder tab — decorative top strip */}
      <div className="
        absolute top-0 left-4 right-0 h-[10px] z-10
        bg-[#C4D1D4]/80 rounded-b-none
        group-hover:bg-[#8697A0]/70 transition-colors duration-300
      " />

      {/* Cover image */}
      <div className="aspect-[4/3] bg-[#E3E8EA] relative overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={album.name}
            fill
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 300px"
            placeholder={album.blurDataUrl ? 'blur' : 'empty'}
            blurDataURL={album.blurDataUrl}
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          /* Placeholder grid when no cover */
          <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-[#D8D3CE]">
            {[0, 1, 2, 3].map(n => (
              <div key={n} className="bg-[#E8E4DF] flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#333C43]/15" />
              </div>
            ))}
          </div>
        )}

        {/* Hover scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />

        {/* Photo count badge */}
        {album.photoCount !== undefined && album.photoCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Images className="w-3 h-3 text-white/80" />
            <span className="text-white/90 text-[10px] font-semibold tabular-nums">
              {album.photoCount}
            </span>
          </div>
        )}
      </div>

      {/* Name strip */}
      <div className="px-4 py-3 bg-white group-hover:bg-[#FAF9F6] transition-colors duration-300">
        <h3 className="
          font-serif text-[15px] text-[#333C43] font-medium
          italic leading-tight truncate text-left
          group-hover:text-[#2D3539] transition-colors duration-300
        ">
          {album.name}
        </h3>
        <p className="text-[11px] text-[#8697A0] font-light mt-0.5 text-left tracking-wide">
          View Album →
        </p>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────
   Main AlbumShowcase
───────────────────────────────────────── */
export function AlbumShowcase({ albums }: AlbumShowcaseProps) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)

  /* ── Navigate to gallery and open this album ── */
  const handleAlbumClick = useCallback(
    (albumId: string) => {
      if (!isDragging) {
        router.push(`/gallery?album=${albumId}`)
      }
    },
    [router, isDragging],
  )

  /* ── Drag-to-scroll (mouse) ── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    setIsDragging(false)
    dragStartX.current = e.pageX - trackRef.current.offsetLeft
    dragScrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    if (e.buttons !== 1) return
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - dragStartX.current) * 1.2
    if (Math.abs(walk) > 4) setIsDragging(true)
    trackRef.current.scrollLeft = dragScrollLeft.current - walk
  }

  const onMouseUp = () => {
    if (trackRef.current) trackRef.current.style.cursor = 'grab'
    // reset drag flag after click propagation completes
    setTimeout(() => setIsDragging(false), 50)
  }

  /* ── Auto-scroll via requestAnimationFrame ── */
  const rafRef = useRef<number | null>(null)
  const SPEED = 0.6 // px per frame (~36px/s at 60fps)

  useEffect(() => {
    const el = trackRef.current
    if (!el || albums.length === 0) return

    const tick = () => {
      if (!isPaused && !isDragging && el) {
        el.scrollLeft += SPEED
        // seamless loop: when we reach the duplicate set, jump back
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPaused, isDragging, albums.length])

  /* ── Empty state ── */
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <FolderOpen className="w-10 h-10 text-[#333C43]/20" />
        <p className="text-[#333C43]/40 text-sm font-light tracking-wide">No albums yet</p>
      </div>
    )
  }

  /* Duplicate for seamless loop */
  const doubled = [...albums, ...albums]

  return (
    <div className="relative w-full">
      {/* Left / Right edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-gradient-to-r from-[#C4D1D4] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-gradient-to-l from-[#C4D1D4] to-transparent" />

      {/* Scrollable track */}
      <div
        ref={trackRef}
        role="list"
        aria-label="Wedding albums"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { setIsPaused(false); onMouseUp() }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="
          flex gap-5 overflow-x-scroll overflow-y-visible
          py-6 px-8
          cursor-grab active:cursor-grabbing
          scrollbar-hide
          select-none
        "
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {doubled.map((album, i) => (
          <div key={`${album._id}-${i}`} role="listitem" className="flex-shrink-0">
            <AlbumCard
              album={album}
              onClick={() => handleAlbumClick(album._id)}
            />
          </div>
        ))}
      </div>

      {/* Hide scrollbar for WebKit */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
