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
import { Table } from '@/components/ui/table'
import type { Transaction } from '../contracts'

export type BulkAction = 'callback' | 'resync' | 'copy'
export interface BulkRequest {
  action: BulkAction
  rows: Transaction[]
}

export function BulkActionDialog({
  request,
  onClose,
}: {
  request: BulkRequest
  onClose: () => void
}) {
  const t = useTranslations('transactions')
  const [complete, setComplete] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const title = t(
    request.action === 'callback'
      ? 'bulkCallback'
      : request.action === 'resync'
        ? 'bulkResync'
        : 'bulkCopy',
  )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t(request.action === 'copy' ? 'bulkCopyDescription' : 'bulkUnavailableDescription')}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium">{t('bulkSelected', { count: request.rows.length })}</p>
        <Table
          containerClassName="max-h-72 overflow-auto rounded-md border"
          className="w-full text-left text-sm"
        >
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{t('reference')}</th>
              <th className="px-3 py-2 font-medium">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {request.rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="break-all px-3 py-3 font-mono text-xs">
                  {row.platform_reference_id}
                </td>
                <td className="px-3 py-3 text-xs">{t(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {copyError
            ? t('copyFailed')
            : complete
              ? t('bulkCopied')
              : t(request.action === 'copy' ? 'bulkCopyHint' : 'bulkEligibilityHint')}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t(complete ? 'bulkClose' : 'cancel')}
          </Button>
          {!complete && request.action === 'copy' && (
            <Button
              onClick={async () => {
                if (request.action === 'copy') {
                  try {
                    await navigator.clipboard.writeText(
                      request.rows.map((row) => row.platform_reference_id).join('\n'),
                    )
                    setCopyError(false)
                    setComplete(true)
                  } catch {
                    setCopyError(true)
                  }
                }
              }}
            >
              {t('bulkCopy')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
