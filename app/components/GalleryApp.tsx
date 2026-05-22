'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  Play, ChevronLeft, ChevronRight, X,
  FolderOpen, Camera, Video as VideoIcon, ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Photo {
  _id: string
  url: string           // full-resolution — used ONLY in lightbox
  thumbnailUrl: string  // ~400px — used in all grids
  blurDataUrl?: string  // tiny inline base64 — used as placeholder
  caption?: string
  albumId?: string
}

interface GalleryAppProps {
  photos: Photo[]
  videos: any[]
  highlights: any[]
  albums: any[]
}

type TabType = 'photos' | 'albums' | 'videos'

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const PHOTOS_PER_PAGE  = 12   // photos tab batch size
const ALBUM_BATCH_SIZE = 16   // album detail batch size

/* ─────────────────────────────────────────
   Masonry size pattern — repeating 8-cycle
───────────────────────────────────────── */
function getMasonryClass(index: number): string {
  const p = index % 8
  if (p === 0) return 'col-span-1 row-span-2'
  if (p === 2) return 'col-span-2 row-span-1'
  if (p === 5) return 'col-span-1 row-span-2'
  if (p === 7) return 'col-span-2 row-span-2'
  return 'col-span-1 row-span-1'
}

function getYouTubeId(urlOrId: string) {
  if (!urlOrId) return ''
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?/#]+)/)
  return match && match[1] ? match[1] : urlOrId
}

/* ─────────────────────────────────────────
   Lazy Image Card
   — uses thumbnailUrl in grid
   — uses blurDataUrl as placeholder
   — only passes full url to lightbox on click
───────────────────────────────────────── */
interface PhotoCardProps {
  photo: Photo
  index: number
  onOpen: (photo: Photo) => void
  isFirst?: boolean // first 4 eager-load, rest lazy
}

function PhotoCard({ photo, index, onOpen, isFirst = false }: PhotoCardProps) {
  return (
    <div
      onClick={() => onOpen(photo)}
      className={`relative group rounded-xl overflow-hidden cursor-pointer bg-[#E8E4DF] ${getMasonryClass(index)}`}
    >
      <Image
        src={photo.thumbnailUrl || photo.url}
        alt={photo.caption || 'Wedding photo'}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        placeholder={photo.blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={photo.blurDataUrl}
        loading={isFirst ? 'eager' : 'lazy'}
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Dark hover scrim */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
      {/* Caption */}
      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-[11px] font-medium line-clamp-2">{photo.caption}</p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Load-More Sentinel (Intersection Observer)
   Fires onVisible when scrolled into view
───────────────────────────────────────── */
function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible() },
      { rootMargin: '200px' } // start loading 200px before it enters viewport
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onVisible])

  return (
    <div ref={ref} className="flex justify-center py-8">
      <div className="w-6 h-6 rounded-full border-2 border-[#333C43]/30 border-t-[#333C43] animate-spin" />
    </div>
  )
}

/* ─────────────────────────────────────────
   Lightbox
   — loads full-resolution url here
   — blur placeholder while full image loads
───────────────────────────────────────── */
interface LightboxState {
  type: 'photo' | 'youtube'
  url?: string         // full-resolution
  thumbnailUrl?: string
  blur?: string
  youtubeId?: string
}

function Lightbox({ state, onClose }: { state: LightboxState; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {state.type === 'photo' && state.url ? (
          <Image
            src={state.url}           // ← full-resolution only in lightbox
            alt="Full size photo"
            fill
            priority                  // load immediately when modal opens
            sizes="90vw"
            placeholder={state.blur ? 'blur' : 'empty'}
            blurDataURL={state.blur}  // blur while full image loads
            className="object-contain rounded-xl shadow-2xl"
          />
        ) : state.type === 'youtube' && state.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(state.youtubeId)}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full max-w-5xl max-h-[80vh] aspect-video rounded-xl shadow-2xl"
          />
        ) : null}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export function GalleryApp({ photos, videos, highlights, albums }: GalleryAppProps) {
  const [activeTab, setActiveTab]     = useState<TabType>('albums')
  const [openHighlight, setOpenHighlight] = useState<any | null>(null)
  const [storyIndex, setStoryIndex]   = useState(0)
  const [openAlbum, setOpenAlbum]     = useState<any | null>(null)
  const [lightbox, setLightbox]       = useState<LightboxState | null>(null)

  // ── Photos tab: pagination ──
  const [photoPage, setPhotoPage]     = useState(1)
  const totalPhotoPages = Math.ceil(photos.length / PHOTOS_PER_PAGE)
  const pagedPhotos     = photos.slice(
    (photoPage - 1) * PHOTOS_PER_PAGE,
    photoPage * PHOTOS_PER_PAGE
  )

  // ── Album detail: batched infinite scroll ──
  const [albumBatch, setAlbumBatch]   = useState(ALBUM_BATCH_SIZE)
  const visibleAlbumPhotos            = openAlbum?.photos?.slice(0, albumBatch) ?? []
  const hasMoreAlbumPhotos            = (openAlbum?.photos?.length ?? 0) > albumBatch
  const loadMoreAlbum                 = useCallback(() => {
    setAlbumBatch(b => b + ALBUM_BATCH_SIZE)
  }, [])

  // Reset album batch when opening a new album
  const handleOpenAlbum = useCallback((album: any) => {
    setOpenAlbum(album)
    setAlbumBatch(ALBUM_BATCH_SIZE)
  }, [])

  // ── Story helpers ──
  const storyTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const STORY_DURATION = 30_000

  const openStory  = useCallback((h: any) => { setOpenHighlight(h); setStoryIndex(0) }, [])
  const closeStory = useCallback(() => { setOpenHighlight(null); setStoryIndex(0) }, [])

  const storyNext = useCallback(() => {
    if (!openHighlight) return
    const items = openHighlight.items || []
    if (storyIndex >= items.length - 1) closeStory()
    else setStoryIndex(i => i + 1)
  }, [openHighlight, storyIndex, closeStory])

  const storyPrev = useCallback(() => {
    setStoryIndex(i => Math.max(0, i - 1))
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (!openHighlight || lightbox) return
    const currentItem = openHighlight.items?.[storyIndex]
    if (currentItem?.type === 'youtube') return
    storyTimerRef.current = setTimeout(storyNext, STORY_DURATION)
    return () => { if (storyTimerRef.current) clearTimeout(storyTimerRef.current) }
  }, [openHighlight, storyIndex, storyNext, lightbox])

  // Keyboard nav for story
  useEffect(() => {
    if (!openHighlight) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') storyNext()
      if (e.key === 'ArrowLeft')  storyPrev()
      if (e.key === 'Escape')     closeStory()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openHighlight, storyNext, storyPrev, closeStory])

  function handleTab(t: TabType) {
    setActiveTab(t)
    setOpenAlbum(null)
    setPhotoPage(1)
  }

  // Open lightbox — always passes full url + blur placeholder
  const openLightbox = useCallback((photo: Photo) => {
    setLightbox({
      type: 'photo',
      url: photo.url,                   // ← full-res only here
      blur: photo.blurDataUrl,          // blur shown while full image loads
    })
  }, [])

  return (
    <div className="w-full font-sans pb-20">

      {/* ══════ PAGE HEADER ══════ */}
      <div className="text-center py-12">
        <p className="text-[#8697A0] text-[11px] tracking-[0.35em] uppercase font-semibold mb-2">Portfolio</p>
        <h1 className="font-serif text-4xl md:text-[52px] font-bold text-[#333C43] leading-none tracking-tight">
          Our Gallery
        </h1>
        <div className="mt-3 mx-auto w-10 h-[2px] bg-[#8697A0]/40 rounded-full" />
      </div>

      {/* ══════ HIGHLIGHTS — Story row ══════ */}
      {highlights.length > 0 && (
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8697A0] font-semibold mb-5 text-center">
            Highlights
          </p>
          <div className="flex gap-5 overflow-x-auto pb-3 px-2 justify-center flex-wrap sm:flex-nowrap scrollbar-hide">
            {highlights.map((h: any, i: number) => (
              <button
                key={h._id || i}
                onClick={() => openStory(h)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none"
              >
                <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#8697A0] via-[#C4D1D4] to-[#333C43] group-hover:from-[#333C43] group-hover:to-[#8697A0] transition-all duration-500 shadow-md">
                  <div className="p-[2px] rounded-full bg-[#FAF9F6]">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                      <Image
                        src={h.cover?.thumbnailUrl || h.cover?.url || ''}
                        alt={h.title}
                        fill
                        sizes="80px"
                        placeholder={h.cover?.blurDataUrl ? 'blur' : 'empty'}
                        blurDataURL={h.cover?.blurDataUrl}
                        loading="lazy"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#333C43] text-center max-w-[80px] leading-tight truncate group-hover:text-[#8697A0] transition-colors">
                  {h.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════ TAB NAVIGATION ══════ */}
      <div className="flex items-center justify-center gap-0 mb-10 border-b border-[#333C43]/10">
        {([
          { key: 'albums', label: 'Albums', icon: <FolderOpen className="w-3.5 h-3.5" /> },
          { key: 'photos', label: 'Photos', icon: <Camera className="w-3.5 h-3.5" /> },
          { key: 'videos', label: 'Videos', icon: <VideoIcon className="w-3.5 h-3.5" /> },
        ] as { key: TabType; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTab(tab.key)}
            className={`
              relative flex items-center gap-2 px-6 md:px-10 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-200
              ${activeTab === tab.key ? 'text-[#333C43]' : 'text-[#333C43]/40 hover:text-[#333C43]/70'}
            `}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#333C43] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ══════ PHOTOS TAB ══════ */}
      {activeTab === 'photos' && (
        <>
          {photos.length === 0 ? (
            <EmptyState icon={<Camera className="w-10 h-10" />} label="No photos yet" />
          ) : (
            <>
              {/* Masonry grid — thumbnailUrl in grid, blurDataUrl as placeholder */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-2 md:gap-3">
                {pagedPhotos.map((p, i) => (
                  <PhotoCard
                    key={p._id || i}
                    photo={p}
                    index={i}
                    onOpen={openLightbox}
                    isFirst={i < 4} // first 4 load eagerly, rest are lazy
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPhotoPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={photoPage <= 1}
                    onClick={() => { setPhotoPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="rounded-full border-[#333C43]/20 text-[#333C43] hover:bg-[#333C43] hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <span className="text-sm text-[#333C43]/50 font-medium tabular-nums">
                    {photoPage} / {totalPhotoPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={photoPage >= totalPhotoPages}
                    onClick={() => { setPhotoPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="rounded-full border-[#333C43]/20 text-[#333C43] hover:bg-[#333C43] hover:text-white disabled:opacity-30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════ ALBUMS TAB — Grid ══════ */}
      {activeTab === 'albums' && !openAlbum && (
        <>
          {albums.length === 0 ? (
            <EmptyState icon={<FolderOpen className="w-10 h-10" />} label="No albums yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {albums.map((album: any) => {
                const count = album.photos?.length || 0
                const cover = album.coverUrl || album.photos?.[0]?.thumbnailUrl || album.photos?.[0]?.url || null
                const blur  = album.photos?.[0]?.blurDataUrl
                return (
                  <div
                    key={album._id}
                    onClick={() => handleOpenAlbum(album)}
                    className="group cursor-pointer relative rounded-2xl overflow-hidden bg-white border border-[#333C43]/8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Cover — thumbnailUrl */}
                    <div className="aspect-[4/3] overflow-hidden bg-[#E8E4DF] relative">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={album.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          placeholder={blur ? 'blur' : 'empty'}
                          blurDataURL={blur}
                          loading="lazy"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-[#D8D3CE]">
                          {[0, 1, 2, 3].map(n => (
                            <div key={n} className="bg-[#E8E4DF] flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-[#333C43]/15" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-lg text-white font-bold leading-snug mb-1">{album.name}</h3>
                      <Badge className="bg-white/20 text-white border-white/20 text-[10px] font-normal backdrop-blur-sm">
                        {count} {count === 1 ? 'photo' : 'photos'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Album Detail — batched infinite scroll ── */}
      {activeTab === 'albums' && openAlbum && (
        <div>
          <button
            onClick={() => setOpenAlbum(null)}
            className="flex items-center gap-2 text-sm text-[#8697A0] hover:text-[#333C43] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Albums
          </button>

          <div className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#333C43] font-bold">{openAlbum.name}</h2>
            <p className="text-[#8697A0] text-sm mt-1">
              {openAlbum.photos?.length || 0} photos
            </p>
          </div>

          {openAlbum.photos?.length > 0 ? (
            <>
              {/* First batch renders immediately, more loads on scroll */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-2 md:gap-3">
                {visibleAlbumPhotos.map((photo: Photo, i: number) => (
                  <PhotoCard
                    key={photo._id || i}
                    photo={photo}
                    index={i}
                    onOpen={openLightbox}
                    isFirst={i < 4}
                  />
                ))}
              </div>

              {/* Intersection Observer sentinel — auto-loads next batch */}
              {hasMoreAlbumPhotos && (
                <LoadMoreSentinel onVisible={loadMoreAlbum} />
              )}

              {/* "All loaded" message */}
              {!hasMoreAlbumPhotos && openAlbum.photos.length > ALBUM_BATCH_SIZE && (
                <p className="text-center text-[#8697A0]/50 text-xs tracking-widest uppercase mt-10">
                  All {openAlbum.photos.length} photos loaded
                </p>
              )}
            </>
          ) : (
            <EmptyState icon={<Camera className="w-10 h-10" />} label="No photos in this album yet" />
          )}
        </div>
      )}

      {/* ══════ VIDEOS TAB ══════ */}
      {activeTab === 'videos' && (
        <>
          {videos.length === 0 ? (
            <EmptyState icon={<VideoIcon className="w-10 h-10" />} label="No videos yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {videos.map((v: any, i: number) => (
                <button
                  key={v._id || i}
                  onClick={() => setLightbox({ type: 'youtube', youtubeId: getYouTubeId(v.youtubeId) })}
                  className="group relative rounded-2xl overflow-hidden bg-[#2D3539] shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 block w-full text-left"
                >
                  <div className="aspect-video overflow-hidden">
                    {/* YouTube thumbnail — lazy loaded */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(v.youtubeId)}/maxresdefault.jpg`}
                      onError={e => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${getYouTubeId(v.youtubeId)}/hqdefault.jpg`
                      }}
                      alt={v.title}
                      loading="lazy"
                      width={640}
                      height={360}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play className="w-6 h-6 text-[#333C43] ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
                    <h3 className="font-serif text-lg md:text-xl text-white font-bold mb-1 line-clamp-2 leading-snug">{v.title}</h3>
                    {v.caption && <p className="text-white/60 text-xs line-clamp-1">{v.caption}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════ HIGHLIGHT STORY VIEWER ══════ */}
      {openHighlight && (() => {
        const items = openHighlight.items || []
        const currentItem = items[storyIndex]
        if (!currentItem && items.length === 0) {
          return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center" onClick={closeStory}>
              <div className="text-white/50 text-sm">No items in this highlight</div>
            </div>
          )
        }
        const safeItem = currentItem || items[0]
        return (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={closeStory}
          >
            <div
              className="relative w-full max-w-[420px] h-[85vh] max-h-[780px] bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Progress bars */}
              <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3 pt-3">
                {items.map((it: any, i: number) => {
                  const isVideo = it.type === 'youtube'
                  return (
                    <div key={i} className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: i < storyIndex ? '100%' : i === storyIndex && isVideo ? '100%' : '0%',
                          backgroundColor: i <= storyIndex ? '#fff' : 'transparent',
                          animation: i === storyIndex && !isVideo ? `storyProgress ${STORY_DURATION}ms linear forwards` : 'none',
                        }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Header */}
              <div className="absolute top-5 left-0 right-0 z-30 flex items-center gap-3 px-4">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#8697A0] to-[#333C43]">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#FAF9F6] p-[1px]">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={openHighlight.cover?.thumbnailUrl || openHighlight.cover?.url || ''}
                        alt={openHighlight.title}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-semibold truncate">{openHighlight.title}</p>
                  <p className="text-white/50 text-[10px]">{storyIndex + 1} / {items.length}</p>
                </div>
                <button
                  onClick={closeStory}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story content — full url for photos in story */}
              <div className="absolute inset-0 z-10">
                {safeItem.type === 'photo' ? (
                  <Image
                    key={storyIndex}
                    src={safeItem.url || safeItem.thumbnailUrl || ''}
                    alt={safeItem.caption || ''}
                    fill
                    priority
                    sizes="420px"
                    placeholder={safeItem.blurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={safeItem.blurDataUrl}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 z-40 bg-black flex flex-col justify-center">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(safeItem.youtubeId)}?autoplay=1&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full z-50 pointer-events-auto border-0"
                    />
                  </div>
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />

              {/* Caption */}
              {(safeItem.caption || safeItem.youtubeTitle) && (
                <div className="absolute bottom-0 left-0 right-0 z-30 p-5 pb-6">
                  <p className="text-white text-sm font-medium leading-relaxed drop-shadow-lg">
                    {safeItem.caption || safeItem.youtubeTitle}
                  </p>
                </div>
              )}

              {/* Tap zones */}
              <div className="absolute inset-0 z-25 flex">
                <button className="w-1/3 h-full cursor-pointer outline-none" onClick={storyPrev} aria-label="Previous" />
                <div className="w-1/3 h-full" />
                <button className="w-1/3 h-full cursor-pointer outline-none" onClick={storyNext} aria-label="Next" />
              </div>

              {/* Arrow buttons */}
              {storyIndex > 0 && (
                <button
                  onClick={storyPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {storyIndex < items.length - 1 && (
                <button
                  onClick={storyNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <style>{`
              @keyframes storyProgress {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        )
      })()}

      {/* ══════ LIGHTBOX ══════ */}
      {lightbox && <Lightbox state={lightbox} onClose={() => setLightbox(null)} />}

    </div>
  )
}

/* ─── Empty state ─── */
function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="text-[#333C43]/10">{icon}</div>
      <p className="text-[#333C43]/35 text-sm font-medium tracking-wide">{label}</p>
    </div>
  )
}
