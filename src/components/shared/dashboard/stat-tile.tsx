import type { LucideIcon } from 'lucide-react'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Tone palette — kept in sync with TONE_STYLES used inline across list pages
 * (orders, invoices, etc.). Adding a new tone:
 *  1. Append to `TONE_STYLES`.
 *  2. Update list pages that pass tone literals if you want them to opt-in.
 */
export const TONE_STYLES = {
  neutral: 'bg-muted text-foreground',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
} as const

export type StatTone = keyof typeof TONE_STYLES

interface StatTileProps {
  icon: LucideIcon
  label: string
  /** Primary value. Strings are rendered verbatim, numbers get en-US grouping. */
  value: number | string
  tone?: StatTone
  /** Secondary helper text below the value (e.g. percentage of total). */
  hint?: React.ReactNode
  /** When provided, the entire tile becomes a link to filtered list / drill-down. */
  href?: string
  /**
   * % change vs comparison period. Positive = up. Pass `null` to render "—".
   * Use `deltaInverted` when up means worse (e.g. overdue count rising).
   */
  delta?: number | null
  deltaInverted?: boolean
  /** Optional label clarifying the delta source ("vs prev period"). */
  deltaLabel?: string
  className?: string
}

export function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  hint,
  href,
  delta,
  deltaInverted,
  deltaLabel,
  className,
}: StatTileProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US') : value
  const showDelta = delta != null && Number.isFinite(delta)

  // Delta tone — by default up = good (emerald), down = bad (red). Inverted flips.
  const deltaIsNeutral = showDelta && delta === 0
  const deltaIsPositive = showDelta && delta! > 0
  const deltaGood = deltaInverted ? !deltaIsPositive : deltaIsPositive
  const DeltaIcon = deltaIsNeutral ? MinusIcon : deltaIsPositive ? TrendingUpIcon : TrendingDownIcon

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="break-words text-xl text-foreground font-semibold leading-none tabular-nums tracking-tight sm:text-2xl">
            {formattedValue}
          </p>
        </div>
        <div className={cn('flex size-9 shrink-0 items-center justify-center', TONE_STYLES[tone])}>
          <Icon className="size-4" />
        </div>
      </div>

      {(hint || showDelta) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
          {hint ? (
            <p className="text-muted-foreground font-medium">{hint}</p>
          ) : (
            <span aria-hidden />
          )}
          {showDelta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold tabular-nums',
                deltaIsNeutral
                  ? 'text-muted-foreground'
                  : deltaGood
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
              )}
              title={deltaLabel}
            >
              <DeltaIcon className="size-3" />
              {Math.abs(delta!).toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {href && (
        <ArrowUpRightIcon
          aria-hidden
          className="text-muted-foreground/40 group-hover:text-foreground absolute top-3 right-3 size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </>
  )

  const cls = cn(
    'relative border border-border bg-card p-4 transition-colors duration-200',
    href && 'group cursor-pointer hover:border-primary/50 hover:bg-surface/60',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return <div className={cls}>{inner}</div>
}

/** Marker icon used in compact toolbars to indicate drill-through is available. */
export const DrillIcon = ArrowRightIcon
