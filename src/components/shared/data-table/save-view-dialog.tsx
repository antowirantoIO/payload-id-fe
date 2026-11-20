'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

interface SaveViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: { name: string; isDefault: boolean }) => void
  isPending?: boolean
  /** Pre-fill nama (mis. "Untitled view"). */
  defaultName?: string
}

/**
 * Dialog generic utk simpan saved view. Tidak peduli resource/state — caller
 * pass current state ke onSubmit lewat closure.
 */
export function SaveViewDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  defaultName = '',
}: SaveViewDialogProps) {
  const [name, setName] = useState(defaultName)
  const [isDefault, setIsDefault] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), isDefault })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setName(defaultName)
          setIsDefault(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
            <DialogDescription>
              Filter, sort, kolom, dan density saat ini akan disimpan sebagai view.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="view-name">Name</Label>
              <Input
                id="view-name"
                placeholder="My active leads…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={60}
                required
              />
              <p className="text-muted-foreground text-xs">Max 60 karakter.</p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                id="save-view-is-default"
                checked={isDefault}
                onCheckedChange={(v) => setIsDefault(Boolean(v))}
              />
              <label htmlFor="save-view-is-default" className="cursor-pointer">
                Set as default view
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Saving…' : 'Save view'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
