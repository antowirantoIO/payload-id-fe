'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { businessTypes, type Merchant, tiers } from '../lib/model'
import { validateMerchant } from '../lib/validate-merchant'

export function MerchantForm({
  initial,
  existing,
  tenants,
  isSaving = false,
  onSave,
  onClose,
}: {
  initial: Merchant
  existing: Merchant[]
  tenants: { id: string; name: string }[]
  isSaving?: boolean
  onSave: (merchant: Merchant) => void
  onClose: () => void
}) {
  const t = useTranslations('merchants')
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const update = (key: keyof Merchant, value: string | boolean) =>
    setDraft((previous) => ({ ...previous, [key]: value }))
  const text = (key: keyof Merchant, label: string, required = false, type = 'text') => (
    <div className="grid gap-2 text-sm" key={key}>
      <Label htmlFor={`merchant-${key}`}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <Input
        id={`merchant-${key}`}
        name={key}
        value={String(draft[key])}
        required={required}
        type={type}
        maxLength={key === 'code' ? 50 : 500}
        disabled={key === 'code' && !!initial.id}
        onChange={(event) => update(key, event.target.value)}
      />
    </div>
  )
  const select = (key: keyof Merchant, label: string, options: readonly string[]) => (
    <div className="grid gap-2 text-sm" key={key}>
      <Label htmlFor={`merchant-${key}`}>{label}</Label>
      <Select
        value={String(draft[key])}
        disabled={key === 'tenant' && !!initial.id}
        onValueChange={(value) => {
          if (value !== null) update(key, value)
        }}
      >
        <SelectTrigger id={`merchant-${key}`} className="h-10 w-full rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
  // Tenants come from IAM: keep both the display name and the UUID used by the API.
  const tenantSelect = (
    <div className="grid gap-2 text-sm">
      <Label htmlFor="merchant-tenant">{t('fields.tenant')}</Label>
      <Select
        value={draft.tenant_id}
        disabled={!!initial.id || tenants.length === 0}
        onValueChange={(value) => {
          if (value === null) return
          const tenant = tenants.find((item) => item.id === value)
          setDraft((previous) => ({
            ...previous,
            tenant_id: value,
            tenant: tenant?.name ?? previous.tenant,
          }))
        }}
      >
        <SelectTrigger id="merchant-tenant" className="h-10 w-full rounded-md">
          <SelectValue placeholder={t('fields.tenant')} />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
  return (
    <section className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {(['business', 'addressRegistration', 'settlementIntegration'] as const).map(
          (id, index) => (
            <Button
              key={id}
              variant={step === index ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStep(index)}
            >
              {index + 1}. {t(id)}
            </Button>
          ),
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const result = validateMerchant(draft, initial, existing)
          if (result.error) {
            setError(
              result.error.key === 'https'
                ? t('validationHttps', { field: t(`urlFields.${result.error.field}`) })
                : t(result.error.key === 'required' ? 'validationRequired' : 'validationDuplicate'),
            )
            setStep(result.error.step)
            return
          }
          onSave(result.merchant)
        }}
        className="space-y-5"
      >
        <div
          className="grid gap-4 sm:grid-cols-2"
          hidden={step !== 0}
          style={step !== 0 ? { display: 'none' } : undefined}
        >
          {tenantSelect}
          {text('code', t('fields.code'))}
          {text('name', t('fields.name'))}
          {text('legal_name', t('fields.legal_name'))}
          {select('business_type', t('fields.business_type'), businessTypes)}
          {text('business_category', t('fields.formCategory'))}
          {select('tier', t('fields.tier'), tiers)}
        </div>
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={step !== 1 ? { display: 'none' } : undefined}
        >
          {text('address', t('fields.address'))}
          {text('city', t('fields.city'))}
          {text('province', t('fields.province'))}
          {text('postal_code', t('fields.postal_code'))}
          {text('npwp', t('fields.npwp'))}
          {text('nib', t('fields.nib'))}
          {text('website', t('fields.website'))}
        </div>
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={step !== 2 ? { display: 'none' } : undefined}
        >
          {select('settlement_mode', t('fields.settlement_mode'), ['BANK', 'WALLET'])}
          {select('settlement_schedule', t('fields.formSchedule'), ['H+1', 'H+2', 'H+3', 'MANUAL'])}
          {text('callback_url', t('fields.callback_url'))}
          {text('callback_url_sandbox', t('fields.callback_url_sandbox'))}
          {text('ip_whitelist', t('fields.formIp'))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_sandbox}
              onChange={(event) => update('is_sandbox', event.target.checked)}
            />
            {t('sandboxEnvironment')}
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('requiredHint')}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
              {t('back')}
            </Button>
          )}
          {step < 2 ? (
            <Button key="continue" type="button" onClick={() => setStep((value) => value + 1)}>
              {t('continue')}
            </Button>
          ) : (
            <Button key="save" type="submit" disabled={isSaving}>
              {t('saveMerchant')}
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}
