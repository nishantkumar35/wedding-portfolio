import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Admin — Wedding Portfolio',
  description: 'Wedding portfolio admin dashboard',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="admin-theme flex h-screen overflow-hidden bg-background">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  )
}
