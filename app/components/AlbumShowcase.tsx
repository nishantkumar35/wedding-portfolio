'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FolderOpen, Images, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface PreviewPhoto {
  thumbnailUrl: string
  blurDataUrl?: string
}

interface Album {
  _id: string
  name: string
  slug?: string
  coverUrl?: string
  photoCount?: number
  thumbnailUrl?: string
  blurDataUrl?: string
  previewPhotos?: PreviewPhoto[]
}

interface AlbumShowcaseProps {
  albums: Album[]
}

/* ─────────────────────────────────────────
   Single Album Card Frame
   — 4 image grid inside a frame container
   — Data below 4 images (Name, Photo count, View Full Album link)
───────────────────────────────────────── */
function AlbumCardFrame({ album }: { album: Album }) {
  const [isNavigating, setIsNavigating] = useState(false)

  // Build array of 4 preview photo URLs
  const previewList = album.previewPhotos?.map(p => p.thumbnailUrl) || []
  const fallbackCover = album.coverUrl || album.thumbnailUrl || null

  // Ensure exactly 4 slots for the 2x2 grid
  const fourSlots = Array.from({ length: 4 }).map((_, i) => {
    if (previewList[i]) return previewList[i]
    if (fallbackCover) return fallbackCover
    return null
  })

  return (
    <div className="group relative w-[280px] sm:w-[320px] shrink-0 bg-white border border-[#333C43]/10 rounded-2xl p-4 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between">
      {/* Top section: 2x2 Grid of 4 images */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#E8E4DF] p-1.5 grid grid-cols-2 gap-1.5">
        {fourSlots.map((photoUrl, idx) => (
          <div key={idx} className="relative w-full h-full overflow-hidden bg-[#D8D3CE] rounded-lg">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`${album.name} preview ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 140px, 160px"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E3E8EA]">
                <FolderOpen className="w-5 h-5 text-[#333C43]/20" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Overlay on click for instant feedback */}
        {isNavigating && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-20 transition-opacity">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-1.5" />
            <span className="text-white text-xs font-semibold tracking-wide">Opening Album...</span>
          </div>
        )}
      </div>

      {/* Bottom section: Album Name, Photo Count & View Full Album link */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-[#333C43] font-bold text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-[#8697A0] transition-colors">
            {album.name}
          </h3>
          {album.photoCount !== undefined && album.photoCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8697A0] bg-[#333C43]/5 px-2 py-0.5 rounded-full shrink-0 border border-[#333C43]/10">
              <Images className="w-3 h-3 text-[#8697A0]" />
              {album.photoCount}
            </span>
          )}
        </div>

        <Link
          href={`/gallery?album=${album._id}`}
          prefetch={true}
          onClick={() => setIsNavigating(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#333C43] hover:text-[#8697A0] transition-colors mt-0.5 tracking-wide group-hover:translate-x-1 transition-transform"
        >
          <span>View Full Album</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main AlbumShowcase
   — Moving animation on X-axis (auto continuous horizontal scrolling marquee)
   — Drag to scroll & Prev/Next button controls
───────────────────────────────────────── */
export function AlbumShowcase({ albums }: AlbumShowcaseProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const rafRef = useRef<number | null>(null)
  const SPEED = 0.75 // Continuous speed along X-axis

  /* ── Continuous X-axis movement via requestAnimationFrame ── */
  useEffect(() => {
    const el = trackRef.current
    if (!el || albums.length === 0) return

    const tick = () => {
      if (!isPaused && !isDragging && el) {
        el.scrollLeft += SPEED
        // Seamless loop: when scrolled halfway through doubled content, reset to start
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

  /* ── Mouse Drag to Scroll ── */
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
    setTimeout(() => setIsDragging(false), 50)
  }

  /* ── Manual Nav Buttons ── */
  const scrollLeftBtn = useCallback(() => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: -340, behavior: 'smooth' })
  }, [])

  const scrollRightBtn = useCallback(() => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: 340, behavior: 'smooth' })
  }, [])

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

  // Duplicate list for seamless infinite loop on X-axis
  const doubledAlbums = albums.length > 2 ? [...albums, ...albums] : albums

  return (
    <div className="relative w-full group/container">
      {/* Prev / Next buttons */}
      <button
        onClick={scrollLeftBtn}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 shadow-lg border border-[#333C43]/15 flex items-center justify-center text-[#333C43] hover:bg-[#333C43] hover:text-white transition-all duration-300 opacity-80 hover:opacity-100 focus:outline-none"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={scrollRightBtn}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 shadow-lg border border-[#333C43]/15 flex items-center justify-center text-[#333C43] hover:bg-[#333C43] hover:text-white transition-all duration-300 opacity-80 hover:opacity-100 focus:outline-none"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Left/Right Edge Gradient Fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 z-10 bg-gradient-to-r from-[#C4D1D4] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 z-10 bg-gradient-to-l from-[#C4D1D4] to-transparent" />

      {/* X-Axis Moving Track */}
      <div
        ref={trackRef}
        role="list"
        aria-label="Wedding albums showcase"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { setIsPaused(false); onMouseUp() }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="
          flex gap-6 overflow-x-auto py-6 px-10
          cursor-grab active:cursor-grabbing
          scrollbar-hide select-none
        "
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {doubledAlbums.map((album, i) => (
          <div key={`${album._id}-${i}`} role="listitem">
            <AlbumCardFrame album={album} />
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
