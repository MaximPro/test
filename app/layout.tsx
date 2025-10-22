import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuperSynergy - Your Local Business Jarvis',
  description: 'AI-Agent-First CRM & Workflow Automation Platform - 100% DSGVO-Compliant',
  keywords: ['AI', 'CRM', 'Automation', 'DSGVO', 'Self-Hosted', 'Business', 'Jarvis'],
  authors: [{ name: 'sx7w8' }],
  creator: 'sx7w8',
  publisher: 'SuperSynergy',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://supersynergy.ai',
    title: 'SuperSynergy - Your Local Business Jarvis',
    description: 'AI-Agent-First CRM & Workflow Automation Platform',
    siteName: 'SuperSynergy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperSynergy - Your Local Business Jarvis',
    description: 'AI-Agent-First CRM & Workflow Automation Platform',
    creator: '@supersynergy',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
