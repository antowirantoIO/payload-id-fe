'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { businessTypes, type Merchant, tenants, tiers } from '../lib/model'

export const selectClass =
  'h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring'

export function MerchantForm({
  initial,
  existing,
  onSave,
  onClose,
}: {
  initial: Merchant
  existing: Merchant[]
  onSave: (merchant: Merchant) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const update = (key: keyof Merchant, value: string | boolean) =>
    setDraft((previous) => ({ ...previous, [key]: value }))
  const text = (key: keyof Merchant, label: string, required = false, type = 'text') => (
    <label htmlFor={`merchant-${key}`} className="grid gap-2 text-sm" key={key}>
      {label}
      {required ? ' *' : ''}
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
    </label>
  )
  const select = (key: keyof Merchant, label: string, options: readonly string[]) => (
    <label className="grid gap-2 text-sm" key={key}>
      {label}
      <select
        className={selectClass}
        value={String(draft[key])}
        disabled={key === 'tenant' && !!initial.id}
        onChange={(event) => update(key, event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
  return (
    <section className="rounded-md border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {['Business', 'Address & registration', 'Settlement & integration'].map((label, index) => (
          <Button
            key={label}
            variant={step === index ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setStep(index)}
          >
            {index + 1}. {label}
          </Button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!draft.code.trim() || !draft.name.trim() || !draft.business_category.trim()) {
            setError('Complete merchant code, business name and category in Business.')
            setStep(0)
            return
          }
          if (
            existing.some(
              (row) =>
                row.id !== initial.id && row.code.toLowerCase() === draft.code.trim().toLowerCase(),
            )
          ) {
            setError('This merchant code is already in use.')
            setStep(0)
            return
          }
          for (const key of ['website', 'callback_url', 'callback_url_sandbox'] as const) {
            if (!draft[key]) continue
            try {
              const url = new URL(draft[key])
              if (url.protocol !== 'https:') throw new Error('protocol')
            } catch {
              setError(`${key.replaceAll('_', ' ')} must be a valid HTTPS URL.`)
              setStep(key === 'website' ? 1 : 2)
              return
            }
          }
          onSave({
            ...draft,
            code: draft.code.trim(),
            name: draft.name.trim(),
            business_category: draft.business_category.trim(),
          })
        }}
        className="space-y-5"
      >
        <div
          className="grid gap-4 sm:grid-cols-2"
          hidden={step !== 0}
          style={step !== 0 ? { display: 'none' } : undefined}
        >
          {select('tenant', 'Tenant', tenants)}
          {text('code', 'Merchant code')}
          {text('name', 'Business name')}
          {text('legal_name', 'Legal name')}
          {select('business_type', 'Business type', businessTypes)}
          {text('business_category', 'Business category')}
          {select('tier', 'Tier', tiers)}
        </div>
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={step !== 1 ? { display: 'none' } : undefined}
        >
          {text('address', 'Address')}
          {text('city', 'City')}
          {text('province', 'Province')}
          {text('postal_code', 'Postal code')}
          {text('npwp', 'NPWP')}
          {text('nib', 'NIB')}
          {text('website', 'Website')}
        </div>
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={step !== 2 ? { display: 'none' } : undefined}
        >
          {select('settlement_mode', 'Settlement mode', ['BANK', 'WALLET'])}
          {select('settlement_schedule', 'Settlement schedule', ['H+1', 'H+2', 'H+3', 'MANUAL'])}
          {text('callback_url', 'Production callback URL')}
          {text('callback_url_sandbox', 'Sandbox callback URL')}
          {text('ip_whitelist', 'IP whitelist (comma-separated)')}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_sandbox}
              onChange={(event) => update('is_sandbox', event.target.checked)}
            />
            Sandbox environment
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Required: merchant code, business name, business category. New merchants start as Draft.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button key="continue" type="button" onClick={() => setStep((value) => value + 1)}>
              Continue
            </Button>
          ) : (
            <Button key="save" type="submit">
              Save merchant
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}
