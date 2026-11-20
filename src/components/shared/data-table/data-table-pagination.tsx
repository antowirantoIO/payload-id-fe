'use client'

import type { Table } from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  summary?: ReactNode
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  summary,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const locale = useLocale()
  const labels =
    locale === 'id'
      ? {
          page: 'Halaman',
          of: 'dari',
          perPage: 'Baris per halaman',
          navigation: 'Navigasi halaman transaksi',
        }
      : locale === 'pt-BR'
        ? {
            page: 'Página',
            of: 'de',
            perPage: 'Linhas por página',
            navigation: 'Paginação de transações',
          }
        : { page: 'Page', of: 'of', perPage: 'Rows per page', navigation: 'Transaction pagination' }

  return (
    <div
      data-slot="table-pagination"
      className="flex flex-col gap-4 border-t border-border/70 px-1 pt-4 pb-1 xl:flex-row xl:items-center xl:justify-between"
    >
      {summary && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {summary}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <p className="text-muted-foreground text-xs font-medium">{labels.perPage}</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (value) {
                table.setPageSize(Number(value))
                table.setPageIndex(0)
              }
            }}
          >
            <SelectTrigger aria-label={labels.perPage} size="sm" className="h-9 w-20 tabular-nums">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav
          aria-label={labels.navigation}
          className="flex items-center justify-between gap-3 sm:justify-start"
        >
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {labels.page}{' '}
            <span className="font-medium text-foreground">{pageCount ? pageIndex + 1 : 0}</span>{' '}
            {labels.of}{' '}
            <span className="font-medium text-foreground">{Math.max(0, pageCount)}</span>
          </span>
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
              className="size-8 rounded-md"
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="size-8 rounded-md"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="size-8 rounded-md"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
              className="size-8 rounded-md"
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}
