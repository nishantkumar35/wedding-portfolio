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
  '@type': ['LocalBusiness', 'ProfessionalService'],
  name: 'Aarsh Wedding Videography',
  alternateName: 'Aarsh Wedding Photography',
  description:
    'Best wedding photographer & videographer in Begusarai, Bihar. Specializing in cinematic wedding photography, wedding films, pre-wedding shoots, candid photography, and drone wedding videography.',
  image: 'https://www.aarshwadding.studio/assets/hero.jpeg',
  '@id': 'https://www.aarshwadding.studio',
  url: 'https://www.aarshwadding.studio',
  telephone: '+919999999999',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Begusarai',
    addressLocality: 'Begusarai',
    addressRegion: 'Bihar',
    postalCode: '851101',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.4167,
    longitude: 86.1333,
  },
  areaServed: [
    { '@type': 'City', name: 'Begusarai' },
    { '@type': 'State', name: 'Bihar' },
    { '@type': 'Country', name: 'India' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Wedding Photography & Videography Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Cinematic Wedding Photography in Begusarai',
          description:
            'Professional cinematic wedding photography capturing every precious moment of your wedding day in Begusarai, Bihar.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Wedding Videography & Cinematic Wedding Films',
          description:
            'High-quality cinematic wedding films and videography services that tell your love story beautifully.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pre-Wedding Photography & Films',
          description:
            'Creative and romantic pre-wedding photo shoots and films in and around Begusarai, Bihar.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Drone Wedding Videography',
          description:
            'Breathtaking aerial drone footage of your wedding venue and ceremony in Begusarai and across Bihar.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Candid Wedding Photography',
          description:
            'Natural, candid wedding photography capturing genuine emotions and unscripted moments throughout your special day.',
        },
      },
    ],
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
      'Sunday',
    ],
    opens: '09:00',
    closes: '21:00',
  },
  sameAs: [
    'https://www.instagram.com/aarsh_wedding_videography/?hl=en',
  ],
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is the best wedding photographer in Begusarai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aarsh Wedding Videography is widely regarded as the best wedding photographer in Begusarai, Bihar. We specialize in cinematic wedding photography, candid photography, and pre-wedding shoots.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is the best wedding videographer in Begusarai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aarsh Wedding Videography is the best wedding videographer in Begusarai, Bihar. We create stunning cinematic wedding films and highlight reels that preserve your memories forever.',
      },
    },
    {
      '@type': 'Question',
      name: 'What services does Aarsh Wedding Videography provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide cinematic wedding films, pre-wedding shoots, engagement photography, drone wedding videography, candid wedding photography, and comprehensive photography & videography packages in Begusarai, Bihar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer pre-wedding shoots in Begusarai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We offer creative and romantic pre-wedding photo shoots and films in Begusarai and across Bihar. Our pre-wedding sessions are tailored to reflect your unique love story.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you provide drone wedding videography in Bihar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we provide professional drone wedding videography across Begusarai and Bihar, capturing stunning aerial footage of your wedding venue and ceremony.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you cover destination weddings outside Begusarai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! While we are based in Begusarai, Bihar, we are ready to travel anywhere in India for destination weddings.',
      },
    },
  ],
}
