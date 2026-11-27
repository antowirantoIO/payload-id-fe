'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRoutingDemo } from '../hooks/use-routing-demo'
import { type RoutingRecord, routingInputSchema } from '../schemas/contracts'

const fields = [
  'provider_code',
  'provider_name',
  'channel_code',
  'channel_name',
  'issuer_channel_code',
  'merchant_scope',
  'min_amount',
  'max_amount',
  'default_expiry_minutes',
] as const
export function RoutingEditorDialog({
  row,
  onClose,
  canSave,
  onSaved,
}: {
  row?: RoutingRecord
  onClose: () => void
  canSave: boolean
  onSaved: () => void
}) {
  const t = useTranslations('routing')
  const { save } = useRoutingDemo()
  const [value, setValue] = useState({
    provider_code: row?.provider_code ?? '',
    provider_name: row?.provider_name ?? '',
    channel_code: row?.channel_code ?? '',
    channel_name: row?.channel_name ?? '',
    merchant_scope: row?.merchant_scope ?? 'ALL_MERCHANTS',
    issuer_channel_code: row?.issuer_channel_code ?? '',
    min_amount: row?.min_amount ?? '',
    max_amount: row?.max_amount ?? '',
    default_expiry_minutes: row?.default_expiry_minutes ?? '',
  })
  const [error, setError] = useState('')
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(row ? 'edit' : 'add')}</DialogTitle>
          <DialogDescription>{t('editorDescription')}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSave) return
            const parsed = routingInputSchema.safeParse({
              ...value,
              status: row?.status ?? 'ACTIVE',
              min_amount: value.min_amount || undefined,
              max_amount: value.max_amount || undefined,
              default_expiry_minutes: value.default_expiry_minutes || undefined,
            })
            if (!parsed.success) {
              setError('required')
              return
            }
            try {
              save(parsed.data, row?.id)
              onSaved()
              onClose()
            } catch {
              setError('duplicate')
            }
          }}
        >
          {fields.map((field) => (
            <div key={field} className="grid gap-2">
              <Label htmlFor={`routing-${field}`}>{t(field)}</Label>
              <Input
                id={`routing-${field}`}
                value={value[field]}
                required={!['min_amount', 'max_amount', 'default_expiry_minutes'].includes(field)}
                maxLength={200}
                inputMode={
                  ['min_amount', 'max_amount', 'default_expiry_minutes'].includes(field)
                    ? 'decimal'
                    : undefined
                }
                onChange={(event) =>
                  setValue((current) => ({ ...current, [field]: event.target.value }))
                }
              />
            </div>
          ))}
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {t(error)}
            </p>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button disabled={!canSave} type="submit">
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
