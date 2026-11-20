'use client'

import {
  type ColumnDef,
  type ColumnPinningState,
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { DataTableBulkBar } from './data-table-bulk-bar'
import { DataTablePagination } from './data-table-pagination'
import { getPinnedColumnStyles } from './lib/pinned-column-styles'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // server-side pagination/sorting
  pagination?: PaginationState
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  // optional UX state
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  columnSizing?: ColumnSizingState
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>
  columnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>

  // appearance
  isLoading?: boolean
  isFetching?: boolean
  errorContent?: ReactNode
  /** Toolbar slot. Function form mendapat `table` instance untuk integrasi
   * dengan DataTableViewOptions, FilterBuilder, dll. */
  toolbar?: ReactNode | ((table: import('@tanstack/react-table').Table<TData>) => ReactNode)
  emptyMessage?: string
  density?: 'compact' | 'normal' | 'comfortable'
  enableColumnResize?: boolean
  enableColumnPinning?: boolean
  stickyHeader?: boolean
  footerSummary?: ReactNode | ((table: import('@tanstack/react-table').Table<TData>) => ReactNode)

  // bulk bar
  bulkActions?: React.ComponentProps<typeof DataTableBulkBar<TData>>['actions']
  getRowId?: (row: TData) => string

  // row click
  onRowClick?: (row: Row<TData>) => void
}

const DENSITY_PADDING = {
  compact: 'py-1.5',
  normal: 'py-3',
  comfortable: 'py-4',
} as const

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  pageCount,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnSizing,
  onColumnSizingChange,
  columnPinning,
  onColumnPinningChange,
  isLoading,
  isFetching,
  errorContent,
  toolbar,
  emptyMessage = 'Tidak ada data.',
  density = 'normal',
  enableColumnResize = false,
  enableColumnPinning = false,
  stickyHeader = false,
  footerSummary,
  bulkActions,
  getRowId,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const isServerSide = pagination !== undefined

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerSide ? (pageCount ?? -1) : undefined,
    state: {
      ...(pagination && { pagination }),
      ...(sorting && { sorting }),
      ...(rowSelection && { rowSelection }),
      ...(columnVisibility && { columnVisibility }),
      ...(columnSizing && { columnSizing }),
      ...(columnPinning && { columnPinning }),
    },
    ...(isServerSide && onPaginationChange ? { onPaginationChange } : {}),
    onSortingChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    onColumnSizingChange,
    onColumnPinningChange,
    enableRowSelection: rowSelection !== undefined,
    enableColumnResizing: enableColumnResize,
    enableColumnPinning,
    columnResizeMode: 'onChange',
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  })

  const cellPad = DENSITY_PADDING[density]
  const hasSelection = rowSelection && Object.keys(rowSelection).length > 0
  const hasLeftPinnedColumns = enableColumnPinning && table.getLeftVisibleLeafColumns().length > 0
  const hasRightPinnedColumns = enableColumnPinning && table.getRightVisibleLeafColumns().length > 0

  return (
    <div className="space-y-3">
      {typeof toolbar === 'function' ? toolbar(table) : toolbar}
      {!errorContent && hasSelection && bulkActions && (
        <DataTableBulkBar table={table} actions={bulkActions} getRowId={getRowId} />
      )}
      {errorContent ? (
        errorContent
      ) : (
        <div className="relative overflow-hidden border border-border bg-card">
          <Table
            containerClassName="max-h-[65vh] overflow-auto"
            style={{
              width: enableColumnResize || enableColumnPinning ? table.getTotalSize() : undefined,
              minWidth: '100%',
            }}
          >
            <TableHeader
              className={cn(
                'bg-surface/60 backdrop-blur supports-[backdrop-filter]:bg-surface/50',
                stickyHeader && 'sticky top-0 z-20 bg-card',
              )}
            >
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const pin = enableColumnPinning
                      ? getPinnedColumnStyles(header.column)
                      : {
                          style: {},
                          isPinned: false as const,
                          isLastLeftPinned: false,
                          isFirstRightPinned: false,
                        }
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width:
                            enableColumnResize || enableColumnPinning
                              ? header.getSize()
                              : undefined,
                          ...pin.style,
                        }}
                        className={cn(
                          'group/header relative h-11 font-medium text-muted-foreground',
                          pin.isPinned && 'bg-surface',
                          pin.isLastLeftPinned && 'border-r border-border',
                          pin.isFirstRightPinned && 'border-l border-border',
                          !pin.isPinned && hasLeftPinnedColumns && 'pl-6',
                          !pin.isPinned && hasRightPinnedColumns && 'pr-6',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {enableColumnResize && header.column.getCanResize() && (
                          <button
                            type="button"
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            aria-label="Resize column"
                            className={cn(
                              'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none transition-opacity',
                              'opacity-0 group-hover/header:opacity-100 hover:bg-primary',
                              header.column.getIsResizing() && 'bg-primary opacity-100',
                            )}
                          />
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
              {isLoading ? (
                Array.from({ length: pagination?.pageSize ?? 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((_col, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
                      <TableCell key={`skeleton-cell-${j}`} className={cellPad}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'group/row transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary/[0.06] data-[state=selected]:hover:bg-primary/[0.08]',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={
                      onRowClick
                        ? (e) => {
                            // Skip kalau klik landing di interactive child (checkbox,
                            // button, link, input, role=button, [data-row-stop])
                            // → biar tidak bentrok dgn row-level edit drawer.
                            const target = e.target as HTMLElement
                            if (
                              target.closest(
                                'button, a, input, label, [role="button"], [role="menuitem"], [role="checkbox"], [data-row-stop]',
                              )
                            ) {
                              return
                            }
                            onRowClick(row)
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const pin = enableColumnPinning
                        ? getPinnedColumnStyles(cell.column)
                        : {
                            style: {},
                            isPinned: false as const,
                            isLastLeftPinned: false,
                            isFirstRightPinned: false,
                          }
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            width:
                              enableColumnResize || enableColumnPinning
                                ? cell.column.getSize()
                                : undefined,
                            ...pin.style,
                          }}
                          className={cn(
                            cellPad,
                            pin.isPinned &&
                              'relative bg-card transition-colors group-hover/row:bg-[color:color-mix(in_oklch,var(--card),var(--muted-foreground)_4%)] group-data-[state=selected]/row:bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))]',
                            pin.isLastLeftPinned && 'border-r border-border',
                            pin.isFirstRightPinned && 'border-l border-border',
                            !pin.isPinned && hasLeftPinnedColumns && 'pl-6',
                            !pin.isPinned && hasRightPinnedColumns && 'pr-6',
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-44 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 px-4">
                      <div className="h-px w-8 bg-border" />
                      <p className="font-medium text-foreground text-sm">No records found</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {emptyMessage}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {!errorContent && (
        <DataTablePagination
          table={table}
          summary={typeof footerSummary === 'function' ? footerSummary(table) : footerSummary}
        />
      )}
    </div>
  )
}

export { DataTableBulkBar } from './data-table-bulk-bar'
export { DataTableSavedViews, type SavedViewItem } from './data-table-saved-views'
export { DataTableSidePanel } from './data-table-side-panel'
export { DataTableViewOptions } from './data-table-view-options'
export { SaveViewDialog } from './save-view-dialog'
export { selectColumn } from './select-column'
