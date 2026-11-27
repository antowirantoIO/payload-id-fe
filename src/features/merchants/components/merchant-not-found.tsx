'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function MerchantNotFound() {
  const t = useTranslations('merchants')
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('notFound')}</h1>
      <p className="text-sm text-muted-foreground">{t('notFoundDescription')}</p>
      <Link href="/merchants" className="text-primary underline">
        {t('backToMerchants')}
      </Link>
    </div>
  )
}
