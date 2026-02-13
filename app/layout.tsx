import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0066FF',
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'GitIQ - GitHub Profile Analyzer & Enhancer',
  description: 'Analyze your GitHub profile with AI-powered insights. Get personalized recommendations to improve your code quality, documentation, and overall developer presence.',
  generator: 'GitIQ',
  authors: [{ name: 'GitIQ Team' }],
  keywords: ['GitHub', 'Profile', 'Analyzer', 'AI', 'Code Quality', 'Developer Portfolio'],
  openGraph: {
    title: 'GitIQ - GitHub Profile Analyzer & Enhancer',
    description: 'Analyze and improve your GitHub profile with AI-powered insights',
    type: 'website',
  },
  icons: {
    icon: '/gitiq-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
