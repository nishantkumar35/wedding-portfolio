'use client'

import {
  BookImage,
  Images,
  Star,
  Video as VideoIcon,
  TrendingUp,
  Activity,
  Mail,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AdminTab } from '../AdminSidebar'

interface DashboardViewProps {
  stats: {
    albums: number
    photos: number
    highlights: number
    videos: number
    inquiries: number
    newInquiries: number
  }
  recentAlbums: any[]
  setActiveTab: (tab: AdminTab) => void
}

export function DashboardView({ stats, recentAlbums, setActiveTab }: DashboardViewProps) {
  const statCards = [
    {
      title: 'Albums',
      value: stats.albums,
      icon: BookImage,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      desc: 'Photo collections',
    },
    {
      title: 'Photos',
      value: stats.photos,
      icon: Images,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      desc: 'Uploaded images',
    },
    {
      title: 'Highlights',
      value: stats.highlights,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      desc: 'Featured stories',
    },
    {
      title: 'Videos',
      value: stats.videos,
      icon: VideoIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      desc: 'YouTube links',
    },
    {
      title: 'Inquiries',
      value: stats.inquiries,
      icon: Mail,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      desc: stats.newInquiries > 0 ? `${stats.newInquiries} new unread` : 'Contact submissions',
    },
  ]

  const quickLinks: { label: string; tab: AdminTab; icon: any; color: string; bg: string }[] = [
    { label: 'New Album',    tab: 'albums',     icon: BookImage,  color: 'text-violet-500',  bg: 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' },
    { label: 'Upload Photos', tab: 'photos',   icon: Images,     color: 'text-sky-500',     bg: 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20' },
    { label: 'New Highlight', tab: 'highlights', icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
    { label: 'Add Video',    tab: 'videos',     icon: VideoIcon,  color: 'text-rose-500',    bg: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' },
    { label: 'Inquiries',    tab: 'inquiries',  icon: Mail,       color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your wedding portfolio content
          </p>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg, border, desc }, i) => (
          <Card
            key={title}
            className={`bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent albums table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: '320ms' }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Activity className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">Recent Albums</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlbums.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No albums yet</p>
            ) : (
              <div className="space-y-2">
                {recentAlbums.map((album: any) => (
                  <div
                    key={album._id.toString()}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <BookImage className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{album.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/{album.slug}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {new Date(album.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ label, tab, icon: Icon, color, bg }) => (
              <button
                key={label}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bg} text-left w-full cursor-pointer`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
