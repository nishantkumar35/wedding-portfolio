'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Plus, Trash2, Edit2, Check, X, Video as VideoIcon, Loader2, Search, Play, ChevronLeft, ChevronRight
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

interface Video {
  _id: string
  youtubeId: string
  title: string
  caption: string
  order: number
  createdAt: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Create form state
  const [youtubeId, setYoutubeId] = useState('')
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  
  // Edit/Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  async function fetchVideos(p = 1) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/videos?page=${p}`)
      const data = await res.json()
      setVideos(data.videos || [])
      setTotalPages(data.totalPages || 1)
      setPage(p)
    } catch {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVideos() }, [])

  function handleYoutubeIdChange(val: string) {
    // Basic regex to extract from various youtube URL formats
    const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?/#]+)/)
    if (match && match[1]) {
      setYoutubeId(match[1])
    } else {
      setYoutubeId(val)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeId, title, caption }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Video added!')
      setYoutubeId(''); setTitle(''); setCaption(''); setOpenCreate(false)
      fetchVideos(page)
    } catch (e: any) {
      toast.error(e.message || 'Failed to add video')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Video deleted')
      fetchVideos(page)
    } catch {
      toast.error('Failed to delete video')
    } finally {
      setDeleteId(null)
    }
  }

  async function handleEdit(video: Video) {
    setSavingEdit(true)
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: video._id, title: editTitle, caption: editCaption }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Video updated')
      setEditId(null)
      fetchVideos(page)
    } catch {
      toast.error('Failed to update video')
    } finally {
      setSavingEdit(false)
    }
  }

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.caption.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <VideoIcon className="w-6 h-6 text-primary" />
            Videos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your cinematic portfolio</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl" />}>
              <Plus className="w-4 h-4" />
              Add Video
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add YouTube Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">YouTube ID or URL</Label>
                <Input
                  value={youtubeId}
                  onChange={e => handleYoutubeIdChange(e.target.value)}
                  placeholder="e.g. dQw4w9WgXcQ or full URL"
                  required
                  className="bg-muted/50 border-border"
                />
                {youtubeId && !youtubeId.includes('youtube.com') && !youtubeId.includes('youtu.be') && (
                  <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-black relative border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2ZmZiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIHRleHQtYW1jaG9yPSJtaWRkbGUiPkludmFsaWQgSUQ8L3RleHQ+PC9zdmc+'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Title</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. The First Dance — Eleanor & James"
                  required
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Caption (optional)</Label>
                <Textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="A short description..."
                  className="bg-muted/50 border-border resize-none text-sm"
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="border-border">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !youtubeId || !title} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Video
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search videos…"
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Videos grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <VideoIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No videos found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {search ? 'Try a different search term' : 'Add your first video to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((video, i) => (
            <div
              key={video._id}
              className="group relative bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up flex flex-col"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Thumbnail */}
              <div className="w-full aspect-video rounded-xl bg-muted/40 border border-border overflow-hidden mb-4 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  onError={(e) => {
                    // Fallback to hqdefault if maxresdefault doesn't exist
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                  }}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-black/50">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col">
                {editId === video._id ? (
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="h-8 text-sm bg-muted/50 border-border font-medium"
                      placeholder="Video Title"
                    />
                    <Textarea
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      className="text-sm bg-muted/50 border-border resize-none"
                      rows={2}
                      placeholder="Caption"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => setEditId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={savingEdit} onClick={() => handleEdit(video)}>
                        {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-foreground line-clamp-1">{video.title}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => { setEditId(video._id); setEditTitle(video.title); setEditCaption(video.caption) }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(video._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {video.caption && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{video.caption}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                      <Badge variant="secondary" className="text-xs bg-muted/50">
                        {new Date(video.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Badge>
                      <a 
                        href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page <= 1}
            onClick={() => fetchVideos(page - 1)}
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
            onClick={() => fetchVideos(page + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Video?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will remove the video from your portfolio. This action cannot be undone.
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
