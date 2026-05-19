'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Upload, Trash2, Images, Loader2, Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface Album { _id: string; name: string; slug: string }
interface Photo {
  _id: string
  albumId: string
  url: string
  thumbnailUrl: string
  caption: string
  createdAt: string
}

export default function PhotosPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openUpload, setOpenUpload] = useState(false)
  const [uploadAlbum, setUploadAlbum] = useState('')
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  async function fetchData(p = 1, albumFilter?: string) {
    setLoading(true)
    try {
      const filterAlbum = albumFilter ?? selectedAlbum
      const albumParam = filterAlbum !== 'all' ? `&albumId=${filterAlbum}` : ''
      const [albumsRes, photosRes] = await Promise.all([
        fetch('/api/admin/album'),
        fetch(`/api/admin/photos?page=${p}${albumParam}`),
      ])
      const albumsData = await albumsRes.json()
      const photosData = await photosRes.json()
      setAlbums(Array.isArray(albumsData) ? albumsData : [])
      setPhotos(photosData.photos || [])
      setTotalPages(photosData.totalPages || 1)
      setPage(p)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  function handleAlbumFilter(val: string | null) {
    setSelectedAlbum(val || 'all')
    fetchData(1, val || 'all')
  }

  function handleFiles(picked: FileList | null) {
    if (!picked) return
    const arr = Array.from(picked)
    setFiles(arr)
    const urls = arr.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadAlbum || files.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    let done = 0

    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('albumId', uploadAlbum)
        fd.append('caption', caption)

        const res = await fetch('/api/admin/photos', { method: 'POST', body: fd })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Upload failed')
        }
        done++
        setUploadProgress(Math.round((done / files.length) * 100))
      }
      toast.success(`${files.length} photo(s) uploaded!`)
      setFiles([]); setPreviews([]); setCaption(''); setUploadAlbum(''); setOpenUpload(false)
      fetchData(page)
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Photo deleted')
      fetchData(page)
    } catch {
      toast.error('Failed to delete photo')
    } finally {
      setDeleteId(null)
    }
  }

  // Client-side caption search on top of server-side album filter + pagination
  const filtered = photos.filter(p =>
    p.caption.toLowerCase().includes(search.toLowerCase())
  )

  const albumName = (id: string) => albums.find(a => a._id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Images className="w-6 h-6 text-primary" />
            Photos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {photos.length} photos across {albums.length} albums
          </p>
        </div>

        <Dialog open={openUpload} onOpenChange={setOpenUpload}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl" />}>
              <Upload className="w-4 h-4" />
              Upload Photos
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Upload Photos</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Album</Label>
                <Select value={uploadAlbum} onValueChange={(val) => setUploadAlbum(val || '')} required>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select album" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {albums.map(a => (
                      <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Images</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {previews.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {previews.slice(0, 8).map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      ))}
                      {previews.length > 8 && (
                        <div className="flex items-center justify-center rounded-lg bg-muted/50 aspect-square text-xs text-muted-foreground font-medium">
                          +{previews.length - 8}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select images</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP — multiple allowed</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Caption (optional)</Label>
                <Textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Add a caption for these photos…"
                  className="bg-muted/50 border-border resize-none text-sm"
                  rows={2}
                />
              </div>

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenUpload(false)} className="border-border">
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || files.length === 0 || !uploadAlbum} className="bg-primary hover:bg-primary/90">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? `Uploading (${uploadProgress}%)` : `Upload ${files.length || ''} Photo${files.length !== 1 ? 's' : ''}`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by caption…"
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={selectedAlbum} onValueChange={handleAlbumFilter}>
          <SelectTrigger className="w-48 bg-card border-border">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by album" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Albums</SelectItem>
            {albums.map(a => (
              <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Images className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No photos found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {search || selectedAlbum !== 'all' ? 'Try adjusting your filters' : 'Upload your first photos to get started'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{filtered.length} photos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((photo, i) => (
              <div
                key={photo._id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border hover:border-primary/30 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <div className="flex items-end justify-between gap-1">
                    <div className="min-w-0">
                      {photo.caption && (
                        <p className="text-xs text-white/90 truncate">{photo.caption}</p>
                      )}
                      <p className="text-[10px] text-white/60 truncate">{albumName(photo.albumId)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 flex-shrink-0 text-white/80 hover:text-red-400 hover:bg-red-500/20 rounded-lg"
                      onClick={() => setDeleteId(photo._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => fetchData(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => fetchData(page + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the photo from Cloudinary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
