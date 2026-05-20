'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Photo {
  _id: string
  url: string
  thumbnailUrl?: string
  blurDataUrl?: string
  caption?: string
}

export function GallerySlider({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch photos on client if initialPhotos is empty (e.g. if server fetch failed)
  useEffect(() => {
    if (initialPhotos.length === 0) {
      fetch('/api/admin/photos')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPhotos(data.slice(0, 10)) // Get top 10 recent photos
          }
        })
        .catch(console.error)
    }
  }, [initialPhotos])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  if (photos.length === 0) {
    return (
      <div className="flex gap-4 overflow-hidden w-full h-80">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[300px] h-full bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative group w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-700 ease-in-out gap-6"
        style={{ transform: `translateX(-${currentIndex * (300 + 24)}px)` }}
      >
        {photos.map((photo, index) => (
          <div 
            key={photo._id} 
            className={`min-w-[300px] h-[400px] rounded-xl overflow-hidden relative transition-all duration-500 ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}
          >
            <Image 
              src={photo.thumbnailUrl || photo.url} 
              alt={photo.caption || 'Captured Moment'} 
              fill
              sizes="300px"
              placeholder={photo.blurDataUrl ? 'blur' : 'empty'}
              blurDataURL={photo.blurDataUrl}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:bg-background border border-border"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:bg-background border border-border"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
}
