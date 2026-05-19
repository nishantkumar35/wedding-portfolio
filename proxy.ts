import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow access to login page
      if (req.nextUrl.pathname.startsWith('/admin/login')) {
        return true
      }
      
      // Require auth for other admin routes
      if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
        return !!token
      }
      
      // Allow public access to all other routes
      return true
    },
  },
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
