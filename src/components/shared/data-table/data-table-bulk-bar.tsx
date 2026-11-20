'use client'

import type { Table } from '@tanstack/react-table'
import { CheckCircle2Icon, Loader2Icon, XIcon } from 'lucide-react'
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
}

/**
 * Bulk action bar — muncul di atas table saat ada row selection.
 * Style: dark "command bar", animate slide-in dari atas, icon + count + actions + clear.
 */
export function DataTableBulkBar<TData>({
  table,
  actions,
  getRowId = (row) => (row as { id?: string }).id ?? '',
}: DataTableBulkBarProps<TData>) {
  const selected = table.getSelectedRowModel().rows
  const count = selected.length

  if (count === 0) return null

  const ids = selected.map((r) => getRowId(r.original)).filter(Boolean)

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-top-2 duration-200',
        'bg-foreground text-background flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 ring-1 ring-foreground/10',
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <CheckCircle2Icon className="text-primary size-4" />
        <span className="text-xs font-semibold tabular-nums">
          {count} {count === 1 ? 'row' : 'rows'} selected
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
                'text-background hover:text-background h-7 gap-1.5 px-2.5 text-xs font-medium transition-colors',
                action.destructive
                  ? 'hover:bg-destructive/40 hover:text-destructive-foreground'
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
        className="text-background/70 hover:bg-background/15 hover:text-background ml-auto h-7 gap-1 px-2 text-xs font-medium"
        onClick={() => table.resetRowSelection()}
        aria-label="Clear selection"
      >
        <XIcon className="size-3.5" />
        Clear
      </Button>
    </div>
  )
}
