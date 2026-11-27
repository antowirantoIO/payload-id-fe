import type { LucideIcon } from 'lucide-react'
import { type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

/** A record's information hierarchy, independent of its enclosing surface. */
export function RecordSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'min-w-0 border-b border-border/70 px-5 py-7 last:border-b-0 sm:px-6',
        className,
      )}
    >
      <div className="mb-6 flex items-start gap-2.5">
        {Icon && (
          <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-sm font-medium leading-6">
            {title}
          </h2>
          {description && (
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}
