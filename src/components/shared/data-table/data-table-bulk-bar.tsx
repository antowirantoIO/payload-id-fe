'use client'

import type { Table } from '@tanstack/react-table'
import { CheckCircle2Icon, Loader2Icon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableBulkBarProps<TData> {
  table: Table<TData>
  /**
   * Actions yg akan ditampilkan ketika ada selection. Mis:
   * `[{ label: 'Soft delete', onSelect: ids => ..., destructive: true }]`
   */
  actions: ReadonlyArray<{
    label: string
    onSelect: (selectedIds: string[]) => void | Promise<void>
    destructive?: boolean
    isPending?: boolean
    icon?: React.ComponentType<{ className?: string }>
  }>
  /** Function untuk extract id dari TData. Default: row.id (TanStack-managed). */
  getRowId?: (row: TData) => string
  selectionLabel?: string
  variant?: 'default' | 'soft'
}

/**
 * Bulk action bar — muncul di atas table saat ada row selection.
 * Style: dark "command bar", animate slide-in dari atas, icon + count + actions + clear.
 */
export function DataTableBulkBar<TData>({
  table,
  actions,
  getRowId = (row) => (row as { id?: string }).id ?? '',
  selectionLabel,
  variant = 'default',
}: DataTableBulkBarProps<TData>) {
  const t = useTranslations('table')
  const selected = table.getSelectedRowModel().rows
  const count = selected.length

  if (count === 0) return null

  const ids = selected.map((r) => getRowId(r.original)).filter(Boolean)

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-top-2 duration-200 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 ring-1',
        variant === 'soft'
          ? 'border border-border bg-card text-foreground shadow-sm ring-border/40'
          : 'bg-foreground text-background ring-foreground/10',
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <CheckCircle2Icon
          className={cn('size-4', variant === 'soft' ? 'text-primary' : 'text-primary')}
        />
        <span className="text-xs font-semibold tabular-nums">
          {selectionLabel ?? t('selectedRows', { count })}
        </span>
      </div>

      <div className="bg-background/20 mx-1 h-5 w-px shrink-0" />

      <div className="flex min-w-0 basis-full flex-wrap items-center gap-1 sm:basis-auto sm:flex-1">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 gap-1.5 px-2.5 text-xs font-medium transition-colors',
                variant === 'soft'
                  ? 'text-foreground hover:bg-accent'
                  : 'text-background hover:text-background',
                action.destructive
                  ? 'hover:bg-destructive/20 hover:text-destructive'
                  : variant === 'soft'
                    ? 'hover:bg-accent'
                    : 'hover:bg-background/15',
              )}
              onClick={() => action.onSelect(ids)}
              disabled={action.isPending}
            >
              {action.isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : Icon ? (
                <Icon className="size-3.5" />
              ) : null}
              {action.label}
            </Button>
          )
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'ml-auto h-8 gap-1 px-2 text-xs font-medium',
          variant === 'soft'
            ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
            : 'text-background/70 hover:bg-background/15 hover:text-background',
        )}
        onClick={() => table.resetRowSelection()}
        aria-label={t('clearSelection')}
      >
        <XIcon className="size-3.5" />
        {t('clear')}
      </Button>
    </div>
  )
}
