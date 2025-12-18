import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Batik & Thread | Modern African Luxury',
  description: 'Bold. Refined. Rooted in Heritage. Discover our collection of contemporary African fashion.',
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

