import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // -------------------------------------------------------------------------
  // Security headers — applied to every route
  // -------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS for 1 year (enable on production only)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Content Security Policy — tightened for a portfolio site
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js inline scripts + EmailJS SDK
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.emailjs.com",
              // Cloudinary images + YouTube thumbnails + Google Fonts
              "img-src 'self' data: blob: https://res.cloudinary.com https://img.youtube.com",
              // Google Fonts stylesheets
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts files
              "font-src 'self' https://fonts.gstatic.com",
              // API calls: EmailJS, Upstash (Redis REST)
              "connect-src 'self' https://api.emailjs.com https://*.upstash.io",
              // YouTube embeds
              "frame-src https://www.youtube.com https://youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [200, 400, 600],
  },
};

export default nextConfig;

