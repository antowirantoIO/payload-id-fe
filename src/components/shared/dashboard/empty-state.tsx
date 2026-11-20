import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  /** Compact = thinner padding, used inside chart cards. */
  compact?: boolean
}

/**
 * Reusable empty state for charts / report panels with no data in the selected
 * range. Pattern mirrors the inline empty states across detail pages but
 * extracted so future modules don't keep re-typing the same skeleton.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 text-center',
        compact ? 'min-h-52 py-8' : 'min-h-64 py-14',
        className,
      )}
    >
      {Icon && (
        <div className="flex size-10 items-center justify-center bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        {description && <p className="text-muted-foreground max-w-sm text-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}
