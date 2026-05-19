'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Plus, Trash2, Edit2, Check, X, Image as ImageIcon, BookImage, Loader2, Search, ChevronRight, ChevronLeft, Upload, Images
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface Album {
  _id: string
  name: string
  slug: string
  coverUrl?: string
  createdAt: string
}

interface Photo {
  _id: string
  albumId: string
  url: string
  thumbnailUrl: string
  caption: string
  createdAt: string
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Album | null>(null)
  
  // Pagination
  const [photoPage, setPhotoPage] = useState(1)
  const [photoTotalPages, setPhotoTotalPages] = useState(1)

  // Album creation
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  
  // Deletion
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null)

  // Uploading
  const [openUpload, setOpenUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchPhotosForAlbum(albumId: string, page: number) {
    try {
      const res = await fetch(`/api/admin/photos?albumId=${albumId}&page=${page}`)
      const data = await res.json()
      setPhotos(data.photos || [])
      setPhotoTotalPages(data.totalPages || 1)
      setPhotoPage(page)
    } catch {
      toast.error('Failed to load photos')
    }
  }

  async function fetchData() {
    setLoading(true)
    try {
      const albumsRes = await fetch('/api/admin/album')
      const albumsData = await albumsRes.json()
      const list = Array.isArray(albumsData) ? albumsData : []
      setAlbums(list)
      
      if (selected) {
        const stillExists = list.find((a: Album) => a._id === selected._id)
        setSelected(stillExists ?? null)
        if (stillExists) {
          fetchPhotosForAlbum(stillExists._id, photoPage)
        }
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (selected) {
      fetchPhotosForAlbum(selected._id, 1)
    } else {
      setPhotos([])
      setPhotoPage(1)
      setPhotoTotalPages(1)
    }
  }, [selected?._id])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Album created!')
      setNewName(''); setNewSlug(''); setOpenCreate(false)
      fetchData()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create album')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/admin/album', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Album deleted')
      if (selected?._id === id) setSelected(null)
      fetchData()
    } catch {
      toast.error('Failed to delete album')
    } finally {
      setDeleteId(null)
    }
  }

  async function handleDeletePhoto(id: string) {
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Photo deleted')
      if (selected) {
        fetchPhotosForAlbum(selected._id, photoPage)
      }
    } catch {
      toast.error('Failed to delete photo')
    } finally {
      setDeletePhotoId(null)
    }
  }

  function handleFiles(picked: FileList | null) {
    if (!picked) return
    const arr = Array.from(picked)
    setFiles(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || files.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    let done = 0

    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('albumId', selected._id)
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
      setFiles([]); setPreviews([]); setCaption(''); setOpenUpload(false)
      fetchData()
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const filteredAlbums = albums.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  )

  const selectedPhotos = photos

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookImage className="w-6 h-6 text-primary" />
            Albums Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage folders and add photos directly to them</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl" />}>
              <Plus className="w-4 h-4" />
              New Folder
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Folder (Album)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Folder Name</Label>
                <Input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewSlug(autoSlug(e.target.value)) }}
                  placeholder="e.g. Pre-Wedding Shoot"
                  required
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Slug</Label>
                <Input
                  value={newSlug}
                  onChange={e => setNewSlug(e.target.value)}
                  placeholder="pre-wedding-shoot"
                  required
                  className="bg-muted/50 border-border font-mono text-sm"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="border-border">Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Folder
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: list */}
        <div className="xl:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search folders…" className="pl-9 bg-card border-border" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-muted/40" />)}
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-10">
              <BookImage className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No folders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAlbums.map(album => (
                <div
                  key={album._id}
                  onClick={() => setSelected(album)}
                  role="button"
                  tabIndex={0}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${selected?._id === album._id ? 'bg-primary/10 border-primary/30 shadow-sm' : 'bg-card border-border hover:border-primary/20 hover:bg-muted/30'}`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/40 flex items-center justify-center">
                    {album.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{album.name}</p>
                    <p className="text-xs text-muted-foreground truncate">/{album.slug}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Click to view photos</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={e => { e.stopPropagation(); setDeleteId(album._id) }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: detail */}
        <div className="xl:col-span-3">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-border bg-card text-center">
              <Images className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">Select a folder to manage photos</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                 <div>
                   <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                   <p className="text-sm text-muted-foreground">/{selected.slug}</p>
                 </div>
                 
                 <Dialog open={openUpload} onOpenChange={setOpenUpload}>
                    <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl" />}>
                        <Upload className="w-4 h-4" />
                        Add Photos
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Photos to {selected.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpload} className="space-y-4 mt-2">
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
                          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Caption (optional, applies to all)</Label>
                          <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." className="bg-muted/50 border-border resize-none text-sm" rows={2} />
                        </div>

                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Uploading…</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setOpenUpload(false)} className="border-border">Cancel</Button>
                          <Button type="submit" disabled={uploading || files.length === 0} className="bg-primary hover:bg-primary/90">
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {uploading ? `Uploading (${uploadProgress}%)` : `Upload ${files.length || ''} Photo${files.length !== 1 ? 's' : ''}`}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
              </div>

              {/* Photos grid */}
              <div className="p-5 flex-grow">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-medium text-foreground">Photos</h3>
                   <Badge variant="secondary" className="text-xs font-normal">{selectedPhotos.length} items</Badge>
                 </div>
                 
                 {selectedPhotos.length === 0 ? (
                    <div className="text-center py-16">
                      <Images className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No photos in this folder yet.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setOpenUpload(true)}>Add Photos</Button>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedPhotos.map(photo => (
                        <div key={photo._id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.thumbnailUrl || photo.url} alt={photo.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-red-400 hover:bg-red-500/20 rounded-lg" onClick={() => setDeletePhotoId(photo._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                 )}

                 {/* Pagination Controls */}
                 {photoTotalPages > 1 && (
                   <div className="flex items-center justify-center gap-4 mt-6">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       disabled={photoPage <= 1}
                       onClick={() => selected && fetchPhotosForAlbum(selected._id, photoPage - 1)}
                     >
                       <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                     </Button>
                     <span className="text-sm text-muted-foreground">
                       Page {photoPage} of {photoTotalPages}
                     </span>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       disabled={photoPage >= photoTotalPages}
                       onClick={() => selected && fetchPhotosForAlbum(selected._id, photoPage + 1)}
                     >
                       Next <ChevronRight className="w-4 h-4 ml-1" />
                     </Button>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete album */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the folder. Photos inside will NOT be deleted from the database, but they will be orphaned unless reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete photo */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the photo from Cloudinary. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePhotoId && handleDeletePhoto(deletePhotoId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
