'use client'

/**
 * Shared cell components used across all data table column definitions.
 */

import { ImageWithFallback } from '@/components/shared/image-with-fallback'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { daysDiff, formatDate, getInitials, relativeTime } from './table-utils'

/**
 * Empty cell placeholder — renders a muted dash.
 */
export function EmptyCell() {
  return <span className="text-muted-foreground/40 text-sm">—</span>
}

/**
 * Avatar circle with initials.
 */
export function AvatarCell({
  name,
  avatarUrl,
  sub,
  size = 'sm',
}: {
  name: string | null | undefined
  avatarUrl?: string | null
  sub?: string | null
  size?: 'xs' | 'sm'
}) {
  const initials = getInitials(name)
  const sizeClass = size === 'xs' ? 'size-5 text-[9px]' : 'size-6 text-[10px]'

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <ImageWithFallback
        src={avatarUrl}
        alt={name ?? ''}
        fallback={initials}
        className={cn(
          'shrink-0 rounded-full object-cover bg-gradient-to-br from-muted to-muted/60 text-muted-foreground ring-border/40 flex items-center justify-center font-semibold ring-1 text-[9px]',
          sizeClass,
        )}
      />
      <div className="min-w-0">
        <span className="text-foreground truncate text-sm">{name ?? '—'}</span>
        {sub && <p className="text-muted-foreground truncate text-[10px]">{sub}</p>}
      </div>
    </div>
  )
}

/**
 * Date cell with optional relative time tooltip.
 */
export function DateCell({
  value,
  showRelative = false,
}: {
  value: string | null | undefined
  showRelative?: boolean
}) {
  if (!value) return <EmptyCell />
  const formatted = formatDate(value)
  const relative = relativeTime(value)

  if (showRelative && relative) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <span className="text-muted-foreground text-sm tabular-nums">{formatted}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {relative}
        </TooltipContent>
      </Tooltip>
    )
  }

  return <span className="text-muted-foreground text-sm tabular-nums">{formatted}</span>
}

/**
 * Due date cell with overdue/warning highlighting.
 */
export function DueDateCell({ value }: { value: string | null | undefined }) {
  if (!value) return <EmptyCell />
  const days = daysDiff(value)
  const formatted = formatDate(value)

  let color = 'text-muted-foreground'
  let hint = ''
  if (days !== null && days > 0) {
    color = 'text-destructive font-medium'
    hint = `${days}d overdue`
  } else if (days !== null && days >= -3) {
    color = 'text-warning font-medium'
    hint = days === 0 ? 'Due today' : `Due in ${Math.abs(days)}d`
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={cn('text-sm tabular-nums', color)}>{formatted}</span>
      </TooltipTrigger>
      {hint && (
        <TooltipContent side="top" className="text-xs">
          {hint}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

/**
 * Numeric badge with color coding (e.g., counts).
 */
export function CountBadge({
  value,
  variant = 'default',
}: {
  value: number | null | undefined
  variant?: 'default' | 'muted'
}) {
  if (value == null || value === 0) return <EmptyCell />
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
        variant === 'muted' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
      )}
    >
      {value}
    </span>
  )
}

/**
 * Progress mini-bar (inline, for percentage columns).
 */
export function ProgressCell({ value, label }: { value: number; label?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted ring-border/40 h-1.5 w-16 overflow-hidden rounded-full ring-1">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            value >= 100 ? 'bg-success' : value >= 50 ? 'bg-primary' : 'bg-warning',
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-muted-foreground text-[11px] font-medium tabular-nums">
        {label ?? `${Math.round(value)}%`}
      </span>
    </div>
  )
}

/**
 * Tags cell — shows up to N tags with overflow count.
 */
export function TagsCell({ tags, max = 2 }: { tags: string[] | null | undefined; max?: number }) {
  if (!tags || tags.length === 0) return <EmptyCell />
  const visible = tags.slice(0, max)
  const overflow = tags.length - max

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <Badge key={tag} variant="outline" className="text-[10px] font-normal">
          {tag}
        </Badge>
      ))}
      {overflow > 0 && <span className="text-muted-foreground text-[10px]">+{overflow}</span>}
    </div>
  )
}

/**
 * Colored dot badge (for statuses without using master data).
 */
export function DotBadge({ label, color }: { label: string; color: string }) {
  return (
    <Badge
      variant="outline"
      className="gap-1 border text-[10px] font-medium transition-colors"
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 10%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 25%, transparent)`,
        color,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </Badge>
  )
}

/**
 * Company cell with building icon.
 */
export function CompanyCell({
  name,
  domain,
}: {
  name: string | null | undefined
  domain?: string | null
}) {
  if (!name) return <EmptyCell />
  return (
    <div className="min-w-0">
      <span className="text-foreground truncate text-sm">{name}</span>
      {domain && <p className="text-muted-foreground truncate text-[10px]">{domain}</p>}
    </div>
  )
}

/**
 * Mono text cell (for codes, numbers, IDs).
 */
export function MonoCell({ value }: { value: string | null | undefined }) {
  if (!value) return <EmptyCell />
  return <span className="text-foreground font-mono text-xs">{value}</span>
}

/**
 * Currency cell with amount formatting.
 */
export function CurrencyCell({
  amount,
  currency,
}: {
  amount: number | string | null | undefined
  currency: string | null | undefined
}) {
  if (amount == null || !currency) return <EmptyCell />
  const num = typeof amount === 'string' ? Number(amount) : amount
  return (
    <span className="text-foreground text-sm font-semibold tabular-nums">
      {currency}{' '}
      {num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}
