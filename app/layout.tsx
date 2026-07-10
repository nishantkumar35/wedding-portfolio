import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aarshwadding.studio'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aarsh Wedding Videography | Best Wedding Videographer in Begusarai',
    template: '%s | Aarsh Wedding Videography'
  },
  description: 'Aarsh Wedding Videography provides the best cinematic wedding films, pre-wedding shoots, and professional wedding photography in Begusarai, Bihar.',
  keywords: ['wedding videography Begusarai', 'best wedding photographer in Begusarai', 'cinematic wedding videographer Bihar', 'pre wedding shoot Begusarai', 'drone wedding videography Begusarai', 'Aarsh Wedding Videography', 'wedding film Begusarai', 'luxury wedding films'],
  authors: [{ name: 'Aarsh Wedding Videography' }],
  creator: 'Aarsh Wedding Videography',
  publisher: 'Aarsh Wedding Videography',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Aarsh Wedding Videography',
    title: 'Aarsh Wedding Videography | Best Wedding Videographer in Begusarai',
    description: 'Aarsh Wedding Videography provides the best cinematic wedding films, pre-wedding shoots, and professional wedding photography in Begusarai, Bihar.',
    images: [
      {
        url: '/assets/hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'Aarsh Wedding Videography in Begusarai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aarsh Wedding Videography | Best Wedding Videographer in Begusarai',
    description: 'Aarsh Wedding Videography provides the best cinematic wedding films, pre-wedding shoots, and professional wedding photography in Begusarai, Bihar.',
    images: ['/assets/hero.jpeg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  )
}
