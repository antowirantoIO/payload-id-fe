'use client'

import { Link, useRouter } from '@/i18n/navigation'
import { useMerchantDemo } from '../hooks/use-merchant-demo'
import { emptyMerchant } from '../lib/model'
import { MerchantForm } from './merchant-form'

export function MerchantEditorPage({ merchantId }: { merchantId?: string }) {
  const { rows, save } = useMerchantDemo()
  const router = useRouter()
  const merchant = merchantId ? rows.find((row) => row.id === merchantId) : emptyMerchant()
  if (!merchant)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Merchant not found</h1>
        <p className="text-sm text-muted-foreground">The requested merchant could not be found.</p>
        <Link href="/merchants" className="text-primary underline">
          Back to merchants
        </Link>
      </div>
    )
  const back = merchantId ? `/merchants/${merchantId}` : '/merchants'
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={back} className="text-sm text-primary underline">
        {merchantId ? 'Back to merchant' : 'Back to merchants'}
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {merchantId ? 'Edit merchant' : 'Add merchant'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the business profile, settlement preferences and integration settings.
        </p>
      </header>
      <MerchantForm
        key={merchantId || 'create'}
        initial={merchant}
        existing={rows}
        onClose={() => router.push(back)}
        onSave={(draft) => router.push(`/merchants/${save(draft)}`)}
      />
    </div>
  )
}
