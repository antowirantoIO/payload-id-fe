'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { toMerchant, useMerchant, useMerchants, useSaveMerchant, useTenants } from '../hooks/use-merchants'
import { emptyMerchant } from '../lib/model'
import { MerchantForm } from './merchant-form'
import { MerchantNotFound } from './merchant-not-found'

export function MerchantEditorPage({ merchantId }: { merchantId?: string }) {
  const t = useTranslations('merchants')
  const router = useRouter()
  const merchantsQuery = useMerchants()
  const merchantQuery = useMerchant(merchantId ?? '')
  const tenantsQuery = useTenants()
  const save = useSaveMerchant()
  const [error, setError] = useState('')

  const rows = merchantsQuery.data ?? []
  const merchant = merchantId
    ? merchantQuery.data
      ? toMerchant(merchantQuery.data)
      : undefined
    : emptyMerchant()

  if (merchantId && merchantQuery.isPending) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  }
  if (!merchant) return <MerchantNotFound />

  const back = merchantId ? `/merchants/${merchantId}` : '/merchants'
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={back} className="text-sm text-primary underline">
        {merchantId ? t('backToMerchant') : t('backToMerchants')}
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {merchantId ? t('editMerchant') : t('addMerchant')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('editorDescription')}</p>
      </header>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <MerchantForm
        key={merchantId || 'create'}
        initial={merchant}
        existing={rows}
        tenants={(tenantsQuery.data ?? []).map((tenant) => ({ id: tenant.id, name: tenant.name }))}
        isSaving={save.isPending}
        onClose={() => router.push(back)}
        onSave={(draft) => {
          setError('')
          save.mutate(
            { merchant: draft, id: merchantId },
            {
              onSuccess: (saved) => router.push(`/merchants/${saved.id}`),
              onError: (cause) =>
                setError(cause instanceof Error ? cause.message : t('loadErrorDescription')),
            },
          )
        }}
      />
    </div>
  )
}
