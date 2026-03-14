import { seoContent, siteMeta } from '@/content/marketingContent';

export const metadata = {
  title: `${siteMeta.brand} — ${siteMeta.tagline}`,
  description: seoContent.metaDescription,
  keywords: seoContent.keywordClusters.join(', '),
  openGraph: {
    title: siteMeta.heroTitle,
    description: siteMeta.heroSubtitle,
    type: 'website',
    siteName: siteMeta.brand,
    url: 'https://traderx.app',
    images: [{ url: 'https://traderx.app/og-image.png', width: 1200, height: 630, alt: 'TraderX Pro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMeta.heroTitle,
    description: siteMeta.heroSubtitle,
    images: ['https://traderx.app/og-image.png'],
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://traderx.app',
  },
  other: {
    'application-name': 'TraderX Pro',
    'msapplication-TileColor': '#0a0a0f',
    'theme-color': '#0a0a0f',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TraderX Pro',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Chrome',
  description: seoContent.metaDescription,
  url: 'https://traderx.app',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '49',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      price: '199',
      priceCurrency: 'USD',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TraderX Pro',
  url: 'https://traderx.app',
  sameAs: [
    'https://x.com/REPLACE_WITH_HANDLE',
    'https://discord.gg/REPLACE_WITH_INVITE',
    'https://t.me/REPLACE_WITH_TRADERX_CHANNEL',
  ],
};

export default function MarketingLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)', color: 'white', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {children}
    </div>
  );
}
