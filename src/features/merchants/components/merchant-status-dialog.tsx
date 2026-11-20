'use client'

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
import { useMerchantDemo } from '../hooks/use-merchant-demo'
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
  onComplete: () => void
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const { changeStatus } = useMerchantDemo()
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change status to {status.replaceAll('_', ' ')}?</DialogTitle>
          <DialogDescription>
            Change the status of {ids.length} selected merchant(s).
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!changeStatus(ids, status, reason)) {
              setError(
                'Status change rejected. Check eligibility and enter at least three non-space characters.',
              )
              return
            }
            onComplete()
          }}
        >
          <label htmlFor="merchant-status-reason" className="grid gap-2 text-sm">
            Reason for change *
            <Input
              id="merchant-status-reason"
              required
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            The reason is recorded in the activity log. Rejected and terminated merchants cannot be
            reactivated.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={['REJECTED', 'TERMINATED'].includes(status) ? 'destructive' : 'default'}
            >
              Confirm change
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
