'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  MessageSquare,
  Trash2,
  RefreshCw,
  Filter,
  User,
  Clock,
  CheckCircle,
  Circle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type InquiryStatus = 'new' | 'read' | 'replied'

interface Inquiry {
  _id: string
  firstName: string
  lastName?: string
  email: string
  phone?: string
  weddingDate?: string
  location?: string
  package?: string
  message?: string
  status: InquiryStatus
  createdAt: string
}

const STATUS_CONFIG: Record<InquiryStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  new:     { label: 'New',     icon: Circle,       color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  read:    { label: 'Read',    icon: CheckCircle,  color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  replied: { label: 'Replied', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

const FILTERS: { label: string; value: string }[] = [
  { label: 'All',     value: '' },
  { label: 'New',     value: 'new' },
  { label: 'Read',    value: 'read' },
  { label: 'Replied', value: 'replied' },
]

export function InquiriesView() {
  const [inquiries, setInquiries]     = useState<Inquiry[]>([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [counts, setCounts]           = useState({ new: 0, read: 0, replied: 0 })
  const [filterStatus, setFilter]     = useState('')
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<Inquiry | null>(null)
  const [updating, setUpdating]       = useState<string | null>(null)
  const [deleting, setDeleting]       = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/inquiries?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setInquiries(data.inquiries)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      if (data.counts) setCounts(data.counts)
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  // Auto-mark as read when opening detail
  async function openDetail(inquiry: Inquiry) {
    setSelected(inquiry)
    if (inquiry.status === 'new') {
      await updateStatus(inquiry._id, 'read')
    }
  }

  async function updateStatus(id: string, status: InquiryStatus) {
    setUpdating(id)
    try {
      await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setInquiries(prev => prev.map(i => i._id === id ? { ...i, status } : i))
      if (selected?._id === id) setSelected(prev => prev ? { ...prev, status } : prev)
      // Update real counts
      setCounts(prev => {
        const next = { ...prev }
        // decrement old status, increment new status
        const old = inquiries.find(i => i._id === id)?.status
        if (old) next[old] = Math.max(0, next[old] - 1)
        next[status] = (next[status] ?? 0) + 1
        return next
      })
    } finally {
      setUpdating(null)
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return
    setDeleting(id)
    try {
      await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setInquiries(prev => prev.filter(i => i._id !== id))
      setTotal(t => t - 1)
      // Decrement the deleted item's status count
      const deletedStatus = inquiries.find(i => i._id === id)?.status
      if (deletedStatus) setCounts(prev => ({ ...prev, [deletedStatus]: Math.max(0, prev[deletedStatus] - 1) }))
      if (selected?._id === id) setSelected(null)
    } finally {
      setDeleting(null)
    }
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }



  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Contact form submissions from potential clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          {counts.new > 0 && (
            <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1">
              {counts.new} new
            </Badge>
          )}
          <button
            onClick={fetchInquiries}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-accent/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-3 gap-3">
        {(['new', 'read', 'replied'] as InquiryStatus[]).map(s => {
          const cfg = STATUS_CONFIG[s]
          const count = counts[s]
          return (
            <Card key={s} className={`bg-card border ${cfg.border} hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => { setFilter(s === filterStatus ? '' : s); setPage(1) }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  filterStatus === f.value
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-muted-foreground border-border hover:bg-accent/30'
                }`}
              >
                <Filter className="w-3 h-3 inline mr-1 opacity-60" />
                {f.label}
              </button>
            ))}
          </div>

          {/* Inquiry list */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No inquiries found</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {inquiries.map(inq => {
                    const cfg = STATUS_CONFIG[inq.status]
                    const isActive = selected?._id === inq._id
                    return (
                      <button
                        key={inq._id}
                        onClick={() => openDetail(inq)}
                        className={`w-full text-left p-4 transition-all duration-150 hover:bg-accent/20 group ${
                          isActive ? 'bg-primary/5 border-l-2 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                              <User className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {inq.firstName} {inq.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{inq.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">{fmtDate(inq.createdAt)}</span>
                          </div>
                        </div>
                        {inq.package && (
                          <p className="text-xs text-muted-foreground mt-2 ml-10.5 truncate">
                            📦 {inq.package}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground text-xs">{total} total inquiries</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-accent/30 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-accent/30 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Detail panel */}
        <div className="xl:col-span-3">
          {selected ? (
            <Card className="bg-card border-border sticky top-6">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${STATUS_CONFIG[selected.status].bg} border ${STATUS_CONFIG[selected.status].border} flex items-center justify-center`}>
                    <User className={`w-5 h-5 ${STATUS_CONFIG[selected.status].color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {selected.firstName} {selected.lastName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fmtDate(selected.createdAt)} at {fmtTime(selected.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Contact details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailField icon={Mail}     label="Email"        value={selected.email} />
                  <DetailField icon={Phone}    label="Phone"        value={selected.phone || '—'} />
                  <DetailField icon={Calendar} label="Wedding Date" value={selected.weddingDate || '—'} />
                  <DetailField icon={MapPin}   label="Location"     value={selected.location || '—'} />
                  <DetailField icon={Package}  label="Package"      value={selected.package || '—'} />
                </div>

                {/* Message */}
                {selected.message && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Message
                    </p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                )}

                {/* Status + Actions */}
                <div className="pt-2 border-t border-border space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['new', 'read', 'replied'] as InquiryStatus[]).map(s => {
                      const cfg = STATUS_CONFIG[s]
                      const isActive = selected.status === s
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected._id, s)}
                          disabled={isActive || updating === selected._id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                            isActive
                              ? `${cfg.bg} ${cfg.color} ${cfg.border} cursor-default`
                              : 'text-muted-foreground border-border hover:bg-accent/30'
                          }`}
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`mailto:${selected.email}?subject=Re: Your Wedding Photography Inquiry&body=Dear ${selected.firstName},%0D%0A%0D%0AThank you for reaching out!`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                    <button
                      onClick={() => deleteInquiry(selected._id)}
                      disabled={deleting === selected._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting === selected._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl p-12">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">Select an inquiry to view details</p>
              <p className="text-xs mt-1 opacity-70">Click any entry from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border">
      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm text-foreground mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}
