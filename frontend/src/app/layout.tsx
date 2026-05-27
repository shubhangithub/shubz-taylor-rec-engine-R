import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music Matrix - AI Music Recommender',
  description: 'Discover new music across artists using AI-powered recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

