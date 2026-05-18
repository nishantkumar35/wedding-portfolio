'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Session } from 'next-auth'

interface AdminHeaderProps {
  session: Session
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const initials = (session.user?.name ?? session.user?.email ?? 'A')
    .charAt(0)
    .toUpperCase()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-sidebar-border)] bg-[var(--admin-header-bg)] backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-medium text-foreground">Welcome back 👋</h2>
        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent/50 transition-colors">
              <Avatar className="w-8 h-8 border border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-none">
                  {session.user?.name ?? 'Admin'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Administrator</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border">
            <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
