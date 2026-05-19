'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Play, ChevronLeft, ChevronRight, X, FolderOpen,
  Star, Video as VideoIcon, Camera, Images, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ─── types ─── */
interface GalleryAppProps {
  photos: any[]
  videos: any[]
  highlights: any[]
  albums: any[]
}

const PHOTOS_PER_PAGE = 12

/* ─── masonry size pattern (repeating cycle) ─── */
function getMasonryClass(index: number): string {
  // Creates a dynamic repeating pattern:
  // 0: tall (2 rows), 1: normal, 2: wide (2 cols), 3: normal, 4: normal, 5: large (2x2)
  const pattern = index % 8
  switch (pattern) {
    case 0: return 'col-span-1 row-span-2'    // tall
    case 1: return 'col-span-1 row-span-1'    // square
    case 2: return 'col-span-2 row-span-1'    // wide
    case 3: return 'col-span-1 row-span-1'    // square
    case 4: return 'col-span-1 row-span-1'    // square
    case 5: return 'col-span-1 row-span-2'    // tall
    case 6: return 'col-span-1 row-span-1'    // square
    case 7: return 'col-span-2 row-span-2'    // large feature
    default: return 'col-span-1 row-span-1'
  }
}

export function GalleryApp({ photos, videos, highlights, albums }: GalleryAppProps) {
  const [activeTab, setActiveTab] = useState('highlights')
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [expandedHighlight, setExpandedHighlight] = useState<any | null>(null)
  const [expandedAlbum, setExpandedAlbum] = useState<any | null>(null)
  const [photoPage, setPhotoPage] = useState(1)

  /* ─── paginated photos ─── */
  const totalPhotoPages = Math.ceil(photos.length / PHOTOS_PER_PAGE)
  const paginatedPhotos = photos.slice(
    (photoPage - 1) * PHOTOS_PER_PAGE,
    photoPage * PHOTOS_PER_PAGE
  )

  return (
    <div className="w-full font-sans">

      {/* ═══════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════ */}
      <div className="text-center pt-12 pb-10">
        <p className="text-[#8697A0] text-[11px] tracking-[0.3em] uppercase font-medium mb-3">
          Portfolio
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#333C43] tracking-tight">
          Our Gallery
        </h1>
        <p className="text-[#8697A0] text-sm mt-3 max-w-md mx-auto font-light leading-relaxed">
          Browse through our curated collection of weddings, highlights, and cinematic films
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          TABS
      ═══════════════════════════════════════════════ */}
      <div className="flex justify-center mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 backdrop-blur-sm border border-[#333C43]/10 rounded-full p-1 shadow-sm">
            <TabsTrigger
              value="highlights"
              className="rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase data-[state=active]:bg-[#333C43] data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2"
            >
              <Star className="w-3.5 h-3.5" /> Highlights
            </TabsTrigger>
            <TabsTrigger
              value="albums"
              className="rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase data-[state=active]:bg-[#333C43] data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Albums
            </TabsTrigger>
            <TabsTrigger
              value="photos"
              className="rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase data-[state=active]:bg-[#333C43] data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2"
            >
              <Camera className="w-3.5 h-3.5" /> Photos
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase data-[state=active]:bg-[#333C43] data-[state=active]:text-white data-[state=active]:shadow-md transition-all gap-2"
            >
              <VideoIcon className="w-3.5 h-3.5" /> Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════
          HIGHLIGHTS TAB
      ═══════════════════════════════════════════════ */}
      {activeTab === 'highlights' && !expandedHighlight && (
        <div>
          {highlights.length === 0 ? (
            <EmptyState icon={<Star className="w-10 h-10" />} text="No highlights yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((h: any) => (
                <div
                  key={h._id}
                  onClick={() => setExpandedHighlight(h)}
                  className="group cursor-pointer relative rounded-2xl overflow-hidden bg-white border border-[#333C43]/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.cover?.thumbnailUrl || h.cover?.url || ''}
                      alt={h.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Title + Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-serif text-xl md:text-2xl text-white font-bold leading-tight mb-1.5">
                      {h.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-white/20 text-[10px] backdrop-blur-sm">
                        {h.items?.length || 0} items
                      </Badge>
                      <span className="text-white/60 text-[10px]">/{h.slug}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Expanded Highlight Detail ─── */}
      {activeTab === 'highlights' && expandedHighlight && (
        <div>
          {/* Back button */}
          <button
            onClick={() => setExpandedHighlight(null)}
            className="flex items-center gap-2 text-sm text-[#8697A0] hover:text-[#333C43] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Highlights
          </button>

          {/* Hero banner */}
          <div className="relative rounded-2xl overflow-hidden mb-10 aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedHighlight.cover?.url || expandedHighlight.cover?.thumbnailUrl || ''}
              alt={expandedHighlight.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
              <h2 className="font-serif text-3xl md:text-5xl text-white font-bold mb-2">
                {expandedHighlight.title}
              </h2>
              <p className="text-white/60 text-sm">
                {expandedHighlight.items?.length || 0} items in this collection
              </p>
            </div>
          </div>

          {/* Items masonry grid */}
          {expandedHighlight.items?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
              {expandedHighlight.items.map((item: any, i: number) => (
                <div
                  key={item._id || i}
                  className={`relative group rounded-xl overflow-hidden cursor-pointer ${getMasonryClass(i)}`}
                  onClick={() => {
                    if (item.type === 'photo') setLightboxImg(item.url || item.thumbnailUrl)
                    if (item.type === 'youtube') window.open(`https://youtube.com/watch?v=${item.youtubeId}`, '_blank')
                  }}
                >
                  {item.type === 'photo' ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl || item.url || ''}
                        alt={item.caption || ''}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs">{item.caption}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
                        alt={item.youtubeTitle || ''}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-xs font-medium">{item.youtubeTitle || 'Video'}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Images className="w-10 h-10" />} text="No items in this highlight yet" />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          ALBUMS TAB
      ═══════════════════════════════════════════════ */}
      {activeTab === 'albums' && !expandedAlbum && (
        <div>
          {albums.length === 0 ? (
            <EmptyState icon={<FolderOpen className="w-10 h-10" />} text="No albums yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album: any) => {
                const coverPhoto = album.photos?.[0]
                const photoCount = album.photos?.length || 0
                return (
                  <div
                    key={album._id}
                    onClick={() => setExpandedAlbum(album)}
                    className="group cursor-pointer relative rounded-2xl overflow-hidden bg-white border border-[#333C43]/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Cover — use first photo or placeholder */}
                    <div className="aspect-[4/3] overflow-hidden bg-[#E8E4DF]">
                      {coverPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={album.coverUrl || coverPhoto.thumbnailUrl || coverPhoto.url}
                          alt={album.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-[#333C43]/20" />
                        </div>
                      )}
                    </div>

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-serif text-xl text-white font-bold mb-1">{album.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/20 text-white border-white/20 text-[10px] backdrop-blur-sm">
                          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Expanded Album Detail ─── */}
      {activeTab === 'albums' && expandedAlbum && (
        <div>
          <button
            onClick={() => setExpandedAlbum(null)}
            className="flex items-center gap-2 text-sm text-[#8697A0] hover:text-[#333C43] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Albums
          </button>

          <div className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-[#333C43] font-bold mb-2">
              {expandedAlbum.name}
            </h2>
            <p className="text-[#8697A0] text-sm">
              {expandedAlbum.photos?.length || 0} photos in this album
            </p>
          </div>

          {expandedAlbum.photos?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
              {expandedAlbum.photos.map((photo: any, i: number) => (
                <div
                  key={photo._id || i}
                  className={`relative group rounded-xl overflow-hidden cursor-pointer ${getMasonryClass(i)}`}
                  onClick={() => setLightboxImg(photo.url || photo.thumbnailUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Camera className="w-10 h-10" />} text="No photos in this album yet" />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PHOTOS TAB — Professional Masonry Grid
      ═══════════════════════════════════════════════ */}
      {activeTab === 'photos' && (
        <div>
          {photos.length === 0 ? (
            <EmptyState icon={<Camera className="w-10 h-10" />} text="No photos yet" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
                {paginatedPhotos.map((p: any, i: number) => (
                  <div
                    key={p._id || i}
                    className={`relative group rounded-xl overflow-hidden cursor-pointer ${getMasonryClass(i)}`}
                    onClick={() => setLightboxImg(p.url || p.thumbnailUrl)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl || p.url}
                      alt={p.caption || ''}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                    {p.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">{p.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPhotoPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={photoPage <= 1}
                    onClick={() => setPhotoPage(p => p - 1)}
                    className="rounded-full border-[#333C43]/20 text-[#333C43] hover:bg-[#333C43] hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <span className="text-sm text-[#333C43]/60 font-medium">
                    {photoPage} / {totalPhotoPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={photoPage >= totalPhotoPages}
                    onClick={() => setPhotoPage(p => p + 1)}
                    className="rounded-full border-[#333C43]/20 text-[#333C43] hover:bg-[#333C43] hover:text-white disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          VIDEOS TAB
      ═══════════════════════════════════════════════ */}
      {activeTab === 'videos' && (
        <div>
          {videos.length === 0 ? (
            <EmptyState icon={<VideoIcon className="w-10 h-10" />} text="No videos yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v: any, i: number) => (
                <a
                  key={v._id || i}
                  href={`https://youtube.com/watch?v=${v.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative rounded-2xl overflow-hidden bg-[#2D3539] shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
                      }}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-[#333C43] ml-1" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-serif text-lg md:text-xl text-white font-bold mb-1 line-clamp-2">
                      {v.title}
                    </h3>
                    {v.caption && (
                      <p className="text-white/60 text-xs line-clamp-1">{v.caption}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          LIGHTBOX
      ═══════════════════════════════════════════════ */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Reusable empty state ─── */
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-[#333C43]/15 mb-4">{icon}</div>
      <p className="text-[#333C43]/40 text-sm font-medium tracking-wide">{text}</p>
    </div>
  )
}
