'use client'

import { useState } from 'react'
import { AdminSidebar, AdminTab } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import type { Session } from 'next-auth'

// Views
import { DashboardView } from './views/DashboardView'
import { AlbumsView } from './views/AlbumsView'
import { PhotosView } from './views/PhotosView'
import { HighlightsView } from './views/HighlightsView'
import { VideosView } from './views/VideosView'
import { InquiriesView } from './views/InquiriesView'

interface AdminAppProps {
  session: Session
  initialStats: any
  initialRecentAlbums: any[]
}

export function AdminApp({ session, initialStats, initialRecentAlbums }: AdminAppProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  return (
    <>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {activeTab === 'dashboard'  && <DashboardView stats={initialStats} recentAlbums={initialRecentAlbums} setActiveTab={setActiveTab} />}
          {activeTab === 'albums'     && <AlbumsView />}
          {activeTab === 'photos'     && <PhotosView />}
          {activeTab === 'highlights' && <HighlightsView />}
          {activeTab === 'videos'     && <VideosView />}
          {activeTab === 'inquiries'  && <InquiriesView />}
        </main>
      </div>
    </>
  )
}
