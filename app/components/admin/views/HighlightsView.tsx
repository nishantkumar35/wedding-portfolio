'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Plus, Trash2, Star, Upload, Video, Image as ImageIcon,
  Loader2, Search, ChevronRight, X, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface HighlightItem {
  _id: string
  type: 'photo' | 'youtube'
  url?: string
  thumbnailUrl?: string
  blurDataUrl?: string
  caption?: string
  youtubeId?: string
  youtubeTitle?: string
}

interface Highlight {
  _id: string
  title: string
  slug: string
  order: number
  cover: { url: string; thumbnailUrl: string; blurDataUrl?: string }
  items: HighlightItem[]
  createdAt: string
}

export function HighlightsView() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Highlight | null>(null)
  const [search, setSearch] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<{ hId: string; itemId: string } | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Create form state
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Add item state
  const [itemType, setItemType] = useState<'photo' | 'youtube'>('photo')
  const [itemFile, setItemFile] = useState<File | null>(null)
  const [itemPreview, setItemPreview] = useState('')
  const [itemCaption, setItemCaption] = useState('')
  const [youtubeId, setYoutubeId] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')

  async function fetchHighlights() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/highlights')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setHighlights(list)
      if (selected) {
        setSelected(list.find((h: Highlight) => h._id === selected._id) ?? null)
      }
    } catch {
      toast.error('Failed to load highlights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHighlights() }, [])

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!coverFile) return
    setCreating(true)
    try {
      const fd = new FormData()
      fd.append('title', newTitle)
      fd.append('slug', newSlug)
      fd.append('cover', coverFile)
      const res = await fetch('/api/admin/highlights', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Highlight created!')
      setNewTitle(''); setNewSlug(''); setCoverFile(null); setCoverPreview(''); setOpenCreate(false)
      fetchHighlights()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create highlight')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Highlight deleted')
      if (selected?._id === id) setSelected(null)
      fetchHighlights()
    } catch {
      toast.error('Failed to delete highlight')
    } finally {
      setDeleteId(null)
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setAddingItem(true)
    try {
      const fd = new FormData()
      fd.append('type', itemType)
      fd.append('caption', itemCaption)
      if (itemType === 'photo') {
        if (!itemFile) throw new Error('Select an image')
        fd.append('file', itemFile)
      } else {
        if (!youtubeId) throw new Error('Enter YouTube ID')
        fd.append('youtubeId', youtubeId)
        fd.append('youtubeTitle', youtubeTitle)
      }
      const res = await fetch(`/api/admin/highlights/${selected._id}`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Item added!')
      setItemFile(null); setItemPreview(''); setItemCaption(''); setYoutubeId(''); setYoutubeTitle(''); setOpenAdd(false)
      fetchHighlights()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setAddingItem(false)
    }
  }

  async function handleDeleteItem(hId: string, itemId: string) {
    try {
      const res = await fetch(`/api/admin/highlights/${hId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Item removed')
      fetchHighlights()
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setDeleteItemId(null)
    }
  }

  const filtered = highlights.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Highlights
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Featured wedding stories with mixed media</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl" />}>
              <Plus className="w-4 h-4" />
              New Highlight
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Highlight</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Title</Label>
                <Input value={newTitle} onChange={e => { setNewTitle(e.target.value); setNewSlug(autoSlug(e.target.value)) }} placeholder="Priya & Rahul — Udaipur" required className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Slug</Label>
                <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="priya-rahul-udaipur" required className="bg-muted/50 border-border font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cover Image</Label>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="" className="w-full h-32 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select cover image</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
                  }}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="border-border">Cancel</Button>
                <Button type="submit" disabled={creating || !coverFile} className="bg-primary hover:bg-primary/90">
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
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
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search highlights…" className="pl-9 bg-card border-border" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-muted/40" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No highlights yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(h => (
                <div
                  key={h._id}
                  onClick={() => setSelected(h)}
                  role="button"
                  tabIndex={0}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${selected?._id === h._id ? 'bg-primary/10 border-primary/30 shadow-sm' : 'bg-card border-border hover:border-primary/20 hover:bg-muted/30'}`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/40">
                    <Image
                      src={h.cover.thumbnailUrl}
                      alt={h.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      placeholder={h.cover.blurDataUrl ? 'blur' : 'empty'}
                      blurDataURL={h.cover.blurDataUrl}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground truncate">/{h.slug}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{h.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={e => { e.stopPropagation(); setDeleteId(h._id) }}>
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
              <Star className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">Select a highlight to view items</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Cover banner */}
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={selected.cover.url}
                  alt={selected.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                  placeholder={selected.cover.blurDataUrl ? 'blur' : 'empty'}
                  blurDataURL={selected.cover.blurDataUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg font-bold text-white">{selected.title}</h3>
                  <p className="text-xs text-white/70">/{selected.slug}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                    <DialogTrigger render={<Button size="sm" className="gap-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm rounded-xl" />}>
                        <Plus className="w-3.5 h-3.5" />
                        Add Item
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Item to Highlight</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddItem} className="space-y-4 mt-2">
                        <Tabs value={itemType} onValueChange={(v) => setItemType((v as any) || 'photo')}>
                          <TabsList className="bg-muted/50">
                            <TabsTrigger value="photo" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                              <ImageIcon className="w-3.5 h-3.5" /> Photo
                            </TabsTrigger>
                            <TabsTrigger value="youtube" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                              <Video className="w-3.5 h-3.5" /> YouTube
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="photo" className="space-y-3 mt-3">
                            <div
                              onClick={() => document.getElementById('item-file-input')?.click()}
                              className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                            >
                              {itemPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={itemPreview} alt="" className="w-full h-32 object-cover rounded-lg" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">Click to select image</p>
                                </>
                              )}
                            </div>
                            <input id="item-file-input" type="file" accept="image/*" className="hidden"
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) { setItemFile(f); setItemPreview(URL.createObjectURL(f)) }
                              }}
                            />
                          </TabsContent>
                          <TabsContent value="youtube" className="space-y-3 mt-3">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">YouTube Video ID</Label>
                              <Input 
                                value={youtubeId} 
                                onChange={e => {
                                  const val = e.target.value;
                                  const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?/#]+)/);
                                  if (match && match[1]) {
                                    setYoutubeId(match[1]);
                                  } else {
                                    setYoutubeId(val);
                                  }
                                }} 
                                placeholder="dQw4w9WgXcQ or full URL" 
                                className="bg-muted/50 border-border font-mono" 
                              />
                              <p className="text-xs text-muted-foreground">From: youtube.com/watch?v=<strong>VIDEO_ID</strong></p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Title</Label>
                              <Input value={youtubeTitle} onChange={e => setYoutubeTitle(e.target.value)} placeholder="Video title" className="bg-muted/50 border-border" />
                            </div>
                          </TabsContent>
                        </Tabs>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Caption (optional)</Label>
                          <Input value={itemCaption} onChange={e => setItemCaption(e.target.value)} placeholder="Caption for this item" className="bg-muted/50 border-border" />
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} className="border-border">Cancel</Button>
                          <Button type="submit" disabled={addingItem} className="bg-primary hover:bg-primary/90">
                            {addingItem && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Item
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Items grid */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">{selected.items.length} items</p>
                {selected.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No items yet. Click "Add Item" to add photos or videos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selected.items.map((item, index) => (
                      <div key={item._id} className="group relative aspect-video rounded-xl overflow-hidden bg-muted/40 border border-border hover:border-primary/30 transition-all">
                        {item.type === 'photo' ? (
                          <Image
                            src={item.thumbnailUrl || item.url!}
                            alt={item.caption || ''}
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            loading={index < 6 ? 'eager' : 'lazy'}
                            placeholder={item.blurDataUrl ? 'blur' : 'empty'}
                            blurDataURL={item.blurDataUrl}
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <Image
                              src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                              alt={item.youtubeTitle || ''}
                              fill
                              sizes="(max-width: 640px) 50vw, 33vw"
                              className="object-cover"
                              loading={index < 6 ? 'eager' : 'lazy'}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-red-600/90 flex items-center justify-center">
                                <Video className="w-4 h-4 text-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-white hover:text-red-400 hover:bg-red-500/20"
                            onClick={() => setDeleteItemId({ hId: selected._id, itemId: item._id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete highlight */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Highlight?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the highlight and all its media. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete item */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remove Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This item will be permanently removed from the highlight.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItemId && handleDeleteItem(deleteItemId.hId, deleteItemId.itemId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
