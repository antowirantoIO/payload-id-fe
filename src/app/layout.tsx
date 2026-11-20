import { Geist, Geist_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  )
}
