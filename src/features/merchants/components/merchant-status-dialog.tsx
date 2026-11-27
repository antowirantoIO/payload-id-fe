'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangeMerchantStatus } from '../hooks/use-merchants'
import type { MerchantStatus } from '../lib/model'

export function MerchantStatusDialog({
  ids,
  status,
  onClose,
  onComplete,
}: {
  ids: string[]
  status: MerchantStatus
  onClose: () => void
  onComplete: (message?: string) => void
}) {
  const t = useTranslations('merchants')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const mutation = useChangeMerchantStatus()
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeStatusTitle', { status: t(`statuses.${status}`) })}</DialogTitle>
          <DialogDescription>
            {t('changeStatusDescription', { count: ids.length })}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (reason.trim().length < 3) {
              setError(t('statusRejected'))
              return
            }
            setError('')
            mutation.mutate(
              { ids, status, reason: reason.trim() },
              {
                onSuccess: () => onComplete(),
                onError: (cause) =>
                  setError(cause instanceof Error ? cause.message : t('statusRejected')),
              },
            )
          }}
        >
          <div className="grid gap-2 text-sm">
            <Label htmlFor="merchant-status-reason">{t('reasonForChange')}</Label>
            <Input
              id="merchant-status-reason"
              required
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('reasonHint')}</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              variant={['REJECTED', 'TERMINATED'].includes(status) ? 'destructive' : 'default'}
            >
              {t('confirmChange')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
