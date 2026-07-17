import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { LenisProvider } from '@/lib/lenis'
import { ScrollInit } from '@/components/ScrollInit'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const youngSerif = localFont({
  src: '../public/fonts/YoungSerif-Regular.ttf',
  variable: '--font-young-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: 'Unotusk — The Project Intelligence Engine',
  description:
    'Your project already knows. Unotusk makes it visible. Every decision your team ever made, reconstructed into intelligence AI can actually use.',
  metadataBase: new URL('https://unotusk.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Unotusk — The Project Intelligence Engine',
    description: 'Your project already knows. Unotusk makes it visible.',
    siteName: 'Unotusk',
    url: 'https://unotusk.com',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Unotusk — The Project Intelligence Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unotusk — The Project Intelligence Engine',
    description: 'Your project already knows. Unotusk makes it visible.',
    images: ['/og.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${youngSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Unotusk',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              url: 'https://unotusk.com',
              description:
                'Your project already knows. Unotusk makes it visible. Every decision your team ever made, reconstructed into intelligence AI can actually use.',
              publisher: {
                '@type': 'Organization',
                name: 'Unotusk',
                url: 'https://unotusk.com',
                logo: 'https://unotusk.com/icon.png',
              },
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          src="/theme-init.js"
        />
        <ScrollInit />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
