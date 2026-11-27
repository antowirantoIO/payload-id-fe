'use client'

import type { ColumnDef, RowData } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * Helper utk bikin checkbox-select column. Pakai di awal `columns` array:
 *   const columns = [selectColumn<User>(), ...]
 *
 * - `enableSorting/Hiding: false` → tidak muncul di view-options & tidak bisa di-sort.
 * - Width default 40px.
 */
export function selectColumn<TData extends RowData>(options?: {
  pageLabel?: string
  rowLabel?: (record: TData) => string
  label?: string
  enableResizing?: boolean
}): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    enableResizing: options?.enableResizing ?? false,
    size: 40,
    header: ({ table }) => {
      const allSelected = table.getIsAllPageRowsSelected()
      const someSelected = table.getIsSomePageRowsSelected()
      return (
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
          aria-label={options?.pageLabel ?? 'Select all rows'}
        />
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
        aria-label={options?.rowLabel?.(row.original) ?? 'Select row'}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    meta: { label: options?.label ?? 'Select' },
  }
}
