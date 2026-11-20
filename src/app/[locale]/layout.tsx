import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'

export const metadata: Metadata = { title: { default: 'Payloads', template: '%s | Payloads' } }
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
