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
import type { Provider, ProviderInput } from '../lib/model'

export function ProviderForm({
  initial,
  onSave,
  onClose,
  errorText,
}: {
  initial?: Provider
  onSave: (value: ProviderInput) => void
  onClose: () => void
  errorText?: string
}) {
  const t = useTranslations('providers')
  const [draft, setDraft] = useState<ProviderInput>({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    base_url: initial?.base_url ?? '',
    status: initial?.status === 'ARCHIVED' ? 'INACTIVE' : (initial?.status ?? 'ACTIVE'),
  })
  return (
    <form
      className="grid gap-4 p-1"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({
          ...draft,
          code: draft.code.trim(),
          name: draft.name.trim(),
          base_url: draft.base_url.trim(),
        })
      }}
    >
      {(['code', 'name', 'base_url'] as const).map((field) => (
        <div className="grid gap-2" key={field}>
          <Label htmlFor={`provider-${field}`}>
            {t(field === 'base_url' ? 'baseUrl' : field)} *
          </Label>
          <Input
            id={`provider-${field}`}
            required
            maxLength={field === 'base_url' ? 500 : 120}
            disabled={field === 'code' && !!initial}
            type={field === 'base_url' ? 'url' : 'text'}
            value={draft[field]}
            onChange={(event) =>
              setDraft((current) => ({ ...current, [field]: event.target.value }))
            }
          />
        </div>
      ))}
      <div className="grid gap-2">
        <Label htmlFor="provider-status">{t('status')}</Label>
        <Select
          value={draft.status}
          onValueChange={(value) => {
            if (value === 'ACTIVE' || value === 'INACTIVE' || value === 'MAINTENANCE')
              setDraft((current) => ({ ...current, status: value }))
          }}
        >
          <SelectTrigger id="provider-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const).map((value) => (
              <SelectItem key={value} value={value}>
                {t(
                  value === 'ACTIVE' ? 'active' : value === 'INACTIVE' ? 'inactive' : 'maintenance',
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {errorText && (
        <p role="alert" className="text-sm text-destructive">
          {errorText}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t('safeEdit')}</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  )
}
