'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Plus, Trash2, Edit2, Check, X, Image as ImageIcon, BookImage, Loader2, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function fetchAlbums() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/album')
      const data = await res.json()
      setAlbums(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlbums() }, [])

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
      fetchAlbums()
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
      fetchAlbums()
    } catch {
      toast.error('Failed to delete album')
    } finally {
      setDeleteId(null)
    }
  }

  async function handleEdit(album: Album) {
    try {
      const res = await fetch('/api/admin/album', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: album._id, name: editName }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Album updated')
      setEditId(null)
      fetchAlbums()
    } catch {
      toast.error('Failed to update album')
    }
  }

  const filtered = albums.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookImage className="w-6 h-6 text-primary" />
            Albums
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your photo collections</p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Album Name</Label>
                <Input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewSlug(autoSlug(e.target.value)) }}
                  placeholder="e.g. Priya & Rahul Wedding"
                  required
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Slug <span className="text-xs">(URL-friendly ID)</span></Label>
                <Input
                  value={newSlug}
                  onChange={e => setNewSlug(e.target.value)}
                  placeholder="priya-rahul-wedding"
                  required
                  className="bg-muted/50 border-border font-mono text-sm"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="border-border">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Album
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
          placeholder="Search albums…"
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Albums grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookImage className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No albums found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {search ? 'Try a different search term' : 'Create your first album to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((album, i) => (
            <div
              key={album._id}
              className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Cover thumbnail */}
              <div className="w-full h-28 rounded-xl bg-muted/40 border border-border overflow-hidden mb-4 flex items-center justify-center">
                {album.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.coverUrl}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>

              {/* Info */}
              {editId === album._id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-8 text-sm bg-muted/50 border-border flex-1"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleEdit(album)}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditId(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{album.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">/{album.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => { setEditId(album._id); setEditName(album.name) }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(album._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {new Date(album.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Album?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the album. This action cannot be undone.
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
