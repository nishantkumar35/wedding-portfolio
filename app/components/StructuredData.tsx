import React from 'react'

export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Aarsh Wedding Videography',
  image: 'https://www.aarshwadding.studio/assets/hero.jpeg',
  '@id': 'https://www.aarshwadding.studio',
  url: 'https://www.aarshwadding.studio',
  telephone: '+919999999999', // Placeholder
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Begusarai',
    addressLocality: 'Begusarai',
    addressRegion: 'Bihar',
    postalCode: '851101', // Example generic code
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.4167,
    longitude: 86.1333
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '09:00',
    closes: '21:00'
  },
  sameAs: [
    'https://www.instagram.com/aarsh_wedding_videography/?hl=en'
  ]
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What services does Aarsh Wedding Videography provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide cinematic wedding films, pre-wedding shoots, engagement photography, drone wedding videography, and comprehensive photography packages in Begusarai, Bihar.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you cover destination weddings outside Begusarai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! While we are based in Begusarai, Bihar, we are ready to travel anywhere for destination weddings.'
      }
    }
  ]
}
