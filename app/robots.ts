import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aarshwadding.studio'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Disallow crawling of admin and API routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
