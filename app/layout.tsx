import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Script from "next/script";


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
    default:
      'Best Wedding Photographer & Videographer in Begusarai, Bihar | Aarsh Wedding Videography',
    template: '%s | Aarsh Wedding Videography',
  },
  description:
    'Looking for the best wedding photographer or wedding videographer in Begusarai, Bihar? Aarsh Wedding Videography specializes in cinematic wedding photography, wedding films, pre-wedding shoots, candid photography, and drone wedding videography.',
  keywords: [
    'best wedding photographer in Begusarai',
    'best photographer in Begusarai',
    'wedding photographer in Begusarai',
    'wedding photography in Begusarai',
    'best wedding photography in Begusarai',
    'wedding videographer in Begusarai',
    'best wedding videographer in Begusarai',
    'wedding videography in Begusarai',
    'best wedding videography in Begusarai',
    'cinematic wedding photographer Begusarai',
    'cinematic wedding videographer Begusarai',
    'candid wedding photographer Begusarai',
    'pre wedding photographer Begusarai',
    'pre wedding shoot Begusarai',
    'drone wedding videography Begusarai',
    'wedding photographer Bihar',
    'best wedding photographer Bihar',
    'wedding photography Bihar',
    'wedding videographer Bihar',
    'best wedding videographer Bihar',
    'wedding videography Bihar',
    'cinematic wedding films Bihar',
    'Aarsh Wedding Videography',
  ],
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
    title:
      'Best Wedding Photographer & Videographer in Begusarai, Bihar | Aarsh Wedding Videography',
    description:
      'Looking for the best wedding photographer or wedding videographer in Begusarai, Bihar? Aarsh Wedding Videography specializes in cinematic wedding photography, wedding films, pre-wedding shoots, candid photography, and drone wedding videography.',
    images: [
      {
        url: '/assets/hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'Best Wedding Photographer & Videographer in Begusarai, Bihar – Aarsh Wedding Videography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Best Wedding Photographer & Videographer in Begusarai, Bihar | Aarsh Wedding Videography',
    description:
      'Looking for the best wedding photographer or wedding videographer in Begusarai, Bihar? Aarsh Wedding Videography specializes in cinematic wedding photography, wedding films, pre-wedding shoots, candid photography, and drone wedding videography.',
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
        <Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>

<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
      </body>
    </html>
  )
}
