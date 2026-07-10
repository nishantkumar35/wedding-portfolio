import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { authLimiter } from '@/lib/ratelimit'
import { headers } from 'next/headers'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin login',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // ── Brute-force protection ──────────────────────────────────────────
        // Rate-limit by email address so each account is guarded independently
        const headersList = await headers()
        const forwarded = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1'
        const ip = forwarded.split(',')[0].trim()
        const key = `${ip}:${credentials.email}`

        const { success } = await authLimiter.limit(key)
        if (!success) {
          // Returning null makes NextAuth show a generic "invalid credentials" error
          // — never reveal that the limit was hit to avoid enumeration
          console.warn(`[auth] rate limit hit for key: ${key}`)
          return null
        }

        if (
          credentials.email    === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin', email: credentials.email }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}