import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const geistSans = GeistSans

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grantcircle.kg'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  title: 'Study free forum — Lead+ Youth Academy',
  description:
    'Масштабное событие для школьников и студентов 11–19 лет о поступлении в топовые университеты мира. Technopark, Bishkek. Offline & Zoom Stream.',
  keywords: [
    'грант', 'стипендия', 'университет', 'поступление за рубеж',
    'Bishkek', 'Central Asia', 'Lead+ Youth Academy', 'Study free forum',
  ],
  authors: [{ name: 'Lead+ Youth Academy' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Study free forum',
    title: 'Study free forum — Lead+ Youth Academy',
    description:
      'Масштабное событие для школьников и студентов 11–19 лет о поступлении в топовые университеты мира.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study free forum — Lead+ Youth Academy',
    description:
      'Масштабное событие для школьников и студентов 11–19 лет о поступлении в топовые университеты мира.',
  },
  generator: 'Next.js',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Study free forum',
  description:
    'Масштабное событие для школьников и студентов 11–19 лет о поступлении в топовые университеты мира. Technopark, Bishkek.',
  startDate: '2026-09-01T12:00:00+06:00',
  endDate:   '2026-09-01T19:00:00+06:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Технопарк',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Технопарк',
      addressLocality: 'Бишкек',
      addressCountry: 'KG',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'Lead+ Youth Academy',
    url: SITE_URL,
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Школьники и студенты 11–19 лет, их родители',
  },
  isAccessibleForFree: false,
  inLanguage: 'ru',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="w-full overflow-x-hidden bg-background">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${geistSans.variable} font-sans antialiased w-full overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors closeButton position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
