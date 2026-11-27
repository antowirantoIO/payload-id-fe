'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  ColumnPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { CopyIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { Button } from '@/components/ui/button'
import { useTransactionDetail } from '../hooks/use-transaction-detail'
import { useTransactionSavedViews } from '../hooks/use-transaction-saved-views'
import { useTransactionTableConfig } from '../hooks/use-transaction-table-config'
import { useTransactionUI } from '../hooks/use-transaction-ui'
import { downloadTransactionsCSV } from '../lib/download'
import { applyTransactionFilter } from '../lib/filter'
import { transactionFormatters } from '../lib/format'
import { filterTransactions } from '../lib/mock'
import { transactionQueryOptions } from '../lib/query-options'
import { orderTransactionDetails, transactionSorting, transactionSortLabel } from '../lib/sorting'
import { defaultVisibility, tabStatuses, type WorkspaceTab, workspaceTabs } from '../lib/views'
import { BulkActionDialog, type BulkRequest } from './bulk-action-dialog'
import { createTransactionColumns } from './transaction-columns'
import { TransactionDetailPanel } from './transaction-detail-panel'
import { TransactionSavedViews, TransactionSaveViewDialog } from './transaction-saved-views'

export function TransactionsPage() {
  const tableConfig = useTransactionTableConfig()
  const t = useTranslations('transactions')
  const locale = useLocale()
  const filters = useTransactionUI((state) => state.filters)
  const setFilter = useTransactionUI((state) => state.setFilter)
  const reset = useTransactionUI((state) => state.reset)
  const [filter, setAdvancedFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility)
  const [tab, setTab] = useState<WorkspaceTab>('allTransactions')

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'platform_reference_id'],
    right: [],
  })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const sort = transactionSortLabel(sorting)
  const savedViews = useTransactionSavedViews({
    filter,
    search: filters.search,
    sort,
    sorting,
    visibility: columnVisibility,
    pinning: columnPinning,
    density,
    tab,
  })
  const { setActiveViewId } = savedViews
  const detail = useTransactionDetail()
  const { inspect } = detail
  const [bulkRequest, setBulkRequest] = useState<BulkRequest | null>(null)
  const [revision, setRevision] = useState(0)
  const query = useQuery(transactionQueryOptions(revision))
  const invalid = Boolean(
    (filters.start && filters.end && filters.start > filters.end) ||
    (filters.minimum && filters.maximum && Number(filters.minimum) > Number(filters.maximum)),
  )
  const rows = useMemo(
    () =>
      invalid
        ? []
        : applyTransactionFilter(filterTransactions(query.data ?? [], filters), filter).filter(
            (row) => !tabStatuses[tab].length || tabStatuses[tab].includes(row.status),
          ),
    [invalid, query.data, filters, filter, tab],
  )
  const orderedRows = useMemo(() => orderTransactionDetails(rows, sorting), [rows, sorting])
  function changeSort(value: string) {
    setSorting(transactionSorting(value))
  }
  const formatters = transactionFormatters(locale)
  const tableColumns = createTransactionColumns({ t, ...formatters, inspect })

  const savedViewsControl = (
    <TransactionSavedViews
      savedViews={savedViews}
      t={t}
      onSelect={(saved) => {
        setActiveViewId(saved?.id ?? null)
        reset()
        setAdvancedFilter(saved?.filter ?? EMPTY_FILTER)
        setTab(saved?.tab ?? 'allTransactions')
        setFilter('search', saved?.search ?? '')
        if (saved?.sorting) setSorting(saved.sorting)
        else changeSort('newest')
        setColumnVisibility(saved?.visibility ?? defaultVisibility)
        setColumnPinning(saved?.pinning ?? { left: ['select', 'platform_reference_id'], right: [] })
        setDensity(saved?.density ?? 'normal')
        setRowSelection({})
      }}
    />
  )
  return (
    <>
      <WorkspaceHeader
        title={t('title')}
        description={<p>{t('description')}</p>}
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              disabled={query.isFetching}
              onClick={() => {
                setRevision((value) => value + 1)
              }}
            >
              <RefreshCwIcon className="size-3.5" />
              {t('reload')}
            </Button>
            <Button
              variant="outline"
              className="h-9"
              disabled={!rows.length || query.isError || query.isPending}
              onClick={() => downloadTransactionsCSV(rows)}
            >
              <DownloadIcon className="size-3.5" />
              {t('export')}
            </Button>
          </>
        }
      />
      <TableWorkspace
        label={t('title')}
        tabs={{
          items: workspaceTabs.map((value) => ({ value, label: t(value) })),
          value: tab,
          onChange: (value) => {
            setTab(value as WorkspaceTab)
            setRowSelection({})
            setActiveViewId(null)
          },
        }}
        loadingLabel={t('loading')}
        isFetching={query.isFetching}
        error={
          query.isError
            ? {
                title: t('loadErrorTitle'),
                description: t('loadErrorDescription'),
                retryLabel: t('retry'),
                preservedLabel: t('loadErrorPreserved'),
                onRetry: () => {
                  setRevision((value) => value + 1)
                },
              }
            : undefined
        }
        footerSummary={(table) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return query.isPending
            ? t('loading')
            : t('resultRange', {
                start: rows.length ? pageIndex * pageSize + 1 : 0,
                end: Math.min((pageIndex + 1) * pageSize, rows.length),
                total: rows.length,
              })
        }}
        columns={tableColumns}
        data={rows}
        isLoading={query.isPending}
        emptyMessage={t('empty')}
        getRowId={(row) => row.id}
        onRowClick={(row) => inspect(row.original)}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
        density={density}
        onDensityChange={setDensity}
        toolbar={{
          ...tableConfig,
          savedViews: savedViewsControl,
          onReset: () => {
            reset()
            setAdvancedFilter(EMPTY_FILTER)
            setRowSelection({})
            setActiveViewId(null)
          },
          search: filters.search,
          onSearch: (value) => {
            setFilter('search', value)
            setRowSelection({})
          },
          filter,
          onFilter: (value) => {
            setAdvancedFilter(value)
            setRowSelection({})
          },
          sort,
          onSort: changeSort,
        }}
        bulkActions={[
          {
            label: t('bulkCallback'),
            icon: RefreshCwIcon,
            onSelect: (ids) =>
              setBulkRequest({
                action: 'callback',
                rows: rows.filter((row) => ids.includes(row.id)),
              }),
          },
          {
            label: t('bulkResync'),
            icon: RefreshCwIcon,
            onSelect: (ids) =>
              setBulkRequest({
                action: 'resync',
                rows: rows.filter((row) => ids.includes(row.id)),
              }),
          },
          {
            label: t('bulkCopy'),
            icon: CopyIcon,
            onSelect: (ids) =>
              setBulkRequest({
                action: 'copy',
                rows: rows.filter((row) => ids.includes(row.id)),
              }),
          },
          {
            label: t('exportSelected'),
            icon: DownloadIcon,
            onSelect: (ids) => downloadTransactionsCSV(rows.filter((row) => ids.includes(row.id))),
          },
        ]}
      />
      <TransactionSaveViewDialog savedViews={savedViews} />
      {bulkRequest && (
        <BulkActionDialog request={bulkRequest} onClose={() => setBulkRequest(null)} />
      )}
      <TransactionDetailPanel detail={detail} orderedRows={orderedRows} t={t} {...formatters} />
    </>
  )
}
