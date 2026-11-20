import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  description?: ReactNode
  /** Right-aligned slot in header — period selector, grain toggle, etc. */
  toolbar?: ReactNode
  /** Action below toolbar — usually a "View report" link. */
  footer?: ReactNode
  children: ReactNode
  className?: string
  /** Removes default padding around children — use when child is a chart that handles its own. */
  flush?: boolean
}

/**
 * Container for a chart or grouped metric. Header has title + optional description
 * + toolbar slot; body holds the visualization. Style aligns with other section
 * cards in detail pages (border-border, sharp editorial surfaces).
 */
export function MetricCard({
  title,
  description,
  toolbar,
  footer,
  children,
  className,
  flush,
}: MetricCardProps) {
  return (
    <section className={cn('flex h-full min-w-0 flex-col border border-border bg-card', className)}>
      <header className="flex flex-col items-start justify-between gap-3 border-b border-border px-4 py-3 sm:flex-row">
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-foreground text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
          )}
        </div>
        {toolbar && (
          <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">{toolbar}</div>
        )}
      </header>
      <div className={cn('flex-1', !flush && 'p-4')}>{children}</div>
      {footer && (
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface/50 px-4 py-2">
          {footer}
        </footer>
      )}
    </section>
  )
}
