import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({ variable: '--font-jakarta-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const fontClassName = `${jakartaSans.variable} ${geistMono.variable} h-full antialiased`

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning className={fontClassName}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  )
}
