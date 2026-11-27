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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type Channel,
  type ChannelDraft,
  channelCategories,
  channelDirections,
  channelStatuses,
} from '../lib/model'

export function ChannelFormDialog({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Channel | ChannelDraft
  onClose: () => void
  onSubmit: (draft: ChannelDraft) => string | null
}) {
  const t = useTranslations('channels')
  const [draft, setDraft] = useState<ChannelDraft>({
    code: initial.code,
    name: initial.name,
    category: initial.category,
    direction: initial.direction,
    currency: initial.currency,
    status: initial.status,
  })
  const [error, setError] = useState('')
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(initial.code ? 'edit' : 'create')}</DialogTitle>
          <DialogDescription>{t(initial.code ? 'editDetails' : 'createDetails')}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const result = onSubmit(draft)
            if (result) {
              setError(result)
              return
            }
            onClose()
          }}
        >
          {(['code', 'name', 'currency'] as const).map((field) => (
            <div className="grid gap-2" key={field}>
              <Label htmlFor={`channel-${field}`}>{t(field)}</Label>
              <Input
                id={`channel-${field}`}
                required
                maxLength={field === 'currency' ? 3 : 120}
                disabled={field === 'code' && !!initial.code}
                value={draft[field]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]:
                      field === 'currency' ? event.target.value.toUpperCase() : event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="grid gap-2">
            <Label htmlFor="channel-category">{t('category')}</Label>
            <Select
              value={draft.category}
              onValueChange={(value) => {
                if (channelCategories.some((item) => item === value))
                  setDraft((current) => ({
                    ...current,
                    category: value as ChannelDraft['category'],
                  }))
              }}
            >
              <SelectTrigger id="channel-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelCategories.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`categories.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="channel-direction">{t('direction')}</Label>
            <Select
              value={draft.direction}
              onValueChange={(value) => {
                if (channelDirections.some((item) => item === value))
                  setDraft((current) => ({
                    ...current,
                    direction: value as ChannelDraft['direction'],
                  }))
              }}
            >
              <SelectTrigger id="channel-direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelDirections.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`directions.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="channel-status">{t('status')}</Label>
            <Select
              value={draft.status}
              onValueChange={(value) => {
                if (channelStatuses.some((item) => item === value))
                  setDraft((current) => ({ ...current, status: value as ChannelDraft['status'] }))
              }}
            >
              <SelectTrigger id="channel-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelStatuses.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`statuses.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {t(error)}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
