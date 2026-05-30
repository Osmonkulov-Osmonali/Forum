import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

const geistSans = GeistSans

export const metadata: Metadata = {
  title: 'Future Leaders Day — Lead+ Youth Academy',
  description: 'Масштабное событие для школьников и студентов 11–19 лет о поступлении в топовые университеты мира. Technopark, Bishkek. Offline & Zoom Stream.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="bg-background">
      <body className={`${inter.variable} ${geistSans.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
