'use client'

import {
  LayoutDashboard,
  Images,
  BookImage,
  Video,
  Star,
  Camera,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AdminTab = 'dashboard' | 'albums' | 'photos' | 'highlights' | 'videos'

const navItems: { label: string; tab: AdminTab; icon: any }[] = [
  { label: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
  { label: 'Albums', tab: 'albums', icon: BookImage },
  { label: 'Photos', tab: 'photos', icon: Images },
  { label: 'Highlights', tab: 'highlights', icon: Star },
  { label: 'Videos', tab: 'videos', icon: Video },
]

interface AdminSidebarProps {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-[var(--admin-sidebar-bg)] border-r border-[var(--admin-sidebar-border)] transition-all duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--admin-sidebar-border)]">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">Wedding Portfolio</p>
          <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-3">
          Management
        </p>
        {navItems.map(({ label, tab, icon: Icon }) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/10 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="flex-1 text-left">{label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--admin-sidebar-border)]">
        <div className="text-xs text-muted-foreground/50 text-center">
          v1.0 · Wedding Portfolio CMS
        </div>
      </div>
    </aside>
  )
}
