'use client'

import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RecordSection } from '@/components/shared/record-section'
import { cn } from '@/lib/utils'

export type MerchantDetailField = {
  label: string
  value: string | undefined
  mono?: boolean
  wide?: boolean
}

export function MerchantDetailSection({
  title,
  description,
  icon,
  fields,
  compact = false,
}: {
  title: string
  description?: string
  icon: LucideIcon
  fields: MerchantDetailField[]
  compact?: boolean
}) {
  const t = useTranslations('merchants')
  return (
    <RecordSection title={title} description={description} icon={icon}>
      <dl className={cn('grid min-w-0 gap-x-10 gap-y-5', !compact && 'sm:grid-cols-2')}>
        {fields.map(({ label, value, mono, wide }) => (
          <div key={label} className={cn('min-w-0', wide && !compact && 'sm:col-span-2')}>
            <dt className="text-xs leading-5 text-muted-foreground">{label}</dt>
            <dd
              className={cn(
                'mt-1 text-sm leading-6 wrap-anywhere',
                mono && 'font-mono text-xs',
                !value && 'text-muted-foreground',
              )}
            >
              {value || t('notProvided')}
            </dd>
          </div>
        ))}
      </dl>
    </RecordSection>
  )
}
