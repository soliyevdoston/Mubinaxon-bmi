import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'EduMind — Boshqaruv paneli',
  description: "EduMind ta'lim platformasi boshqaruv paneli",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
