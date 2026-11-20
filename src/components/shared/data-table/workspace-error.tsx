'use client'

import { CloudOffIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkspaceError({
  title,
  description,
  retryLabel,
  preservedLabel,
  pending,
  onRetry,
}: {
  title: string
  description: string
  retryLabel: string
  preservedLabel: string
  pending?: boolean
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex min-h-80 flex-col items-center justify-center rounded-md border border-border bg-muted/10 px-5 py-12 text-center"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-full border bg-background text-muted-foreground">
        <CloudOffIcon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Button className="mt-6 h-10 gap-2" disabled={pending} onClick={onRetry}>
        <RefreshCwIcon className="size-4" />
        {retryLabel}
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">{preservedLabel}</p>
    </div>
  )
}
