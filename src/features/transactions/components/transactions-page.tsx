'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  ColumnDef,
  ColumnPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { SaveViewDialog } from '@/components/shared/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { DataTableSidePanel } from '@/components/shared/data-table/data-table-side-panel'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceSavedViews } from '@/components/shared/data-table/workspace-saved-views'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Transaction } from '../contracts'
import { useTransactionTableConfig } from '../hooks/use-transaction-table-config'
import { useTransactionUI } from '../hooks/use-transaction-ui'
import { applyTransactionFilter } from '../lib/filter'
import { filterTransactions, loadMockTransactions } from '../lib/mock'
import { BulkActionDialog, type BulkRequest } from './bulk-action-dialog'

type Copy = ReturnType<typeof useTranslations<'transactions'>>
const defaultVisibility: VisibilityState = {
  external_id: false,
  customer_email: false,
  paid_at: false,
  expired_at: false,
}
const workspaceTabs = ['allTransactions', 'needsReview', 'awaitingPayment', 'successful'] as const
type WorkspaceTab = (typeof workspaceTabs)[number]
const tabStatuses: Record<WorkspaceTab, string[]> = {
  allTransactions: [],
  needsReview: ['FAILED', 'REFUND_FAILED', 'PENDING_APPROVAL'],
  awaitingPayment: ['PENDING', 'PROCESSING'],
  successful: ['PAID', 'SUCCESS'],
}

function Status({ value, t }: { value: string; t: Copy }) {
  const success = ['PAID', 'SUCCESS', 'SETTLED'].includes(value)
  const failure = ['FAILED', 'REFUND_FAILED'].includes(value)
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-sm border px-2 py-1 text-xs font-medium',
        success
          ? 'border-emerald-700/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : failure
            ? 'border-red-700/20 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
            : 'border-border bg-muted text-foreground',
      )}
    >
      {t(value)}
    </span>
  )
}

function downloadMockCSV(rows: Transaction[]) {
  const fields = [
    'id',
    'external_id',
    'platform_reference_id',
    'transaction_type',
    'status',
    'amount',
    'currency',
    'fee_amount',
    'net_amount',
    'channel_code',
    'settlement_status',
    'environment',
    'created_at',
  ] as const
  const quoteCSV = (value: string) => `"${value.replaceAll('"', '""')}"`
  const content = [
    fields.join(','),
    ...rows.map((row) => fields.map((key) => quoteCSV(row[key] ?? '')).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'payment-transactions.csv'
  link.click()
  URL.revokeObjectURL(url)
}

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
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'platform_reference_id'],
    right: [],
  })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const primarySort = sorting[0]
  const sort =
    sorting.length !== 1
      ? 'custom'
      : primarySort?.id === 'created_at'
        ? primarySort.desc
          ? 'newest'
          : 'oldest'
        : primarySort?.id === 'amount'
          ? primarySort.desc
            ? 'amount_desc'
            : 'amount_asc'
          : 'custom'
  const [views, setViews] = useState<
    {
      id: string
      name: string
      is_default: boolean
      filter: FilterGroup
      search: string
      sort: string
      sorting: SortingState
      visibility: VisibilityState
      pinning: ColumnPinningState
      density: typeof density
      tab: WorkspaceTab
    }[]
  >([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [bulkRequest, setBulkRequest] = useState<BulkRequest | null>(null)
  const [revision, setRevision] = useState(0)
  const query = useQuery({
    queryKey: ['mock-payment-transactions', revision],
    queryFn: ({ signal }) => loadMockTransactions(signal, false),
    retry: false,
    staleTime: Infinity,
  })
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
  const orderedRows = useMemo(() => {
    const order = sorting[0]
    if (!order) return rows
    return [...rows].sort((a, b) => {
      const value = (row: Transaction) =>
        order.id === 'merchant_name'
          ? (row.merchant?.name ?? '')
          : String(row[order.id as keyof Transaction] ?? '')
      const comparison = ['amount', 'fee_amount', 'net_amount'].includes(order.id)
        ? Number(value(a)) - Number(value(b))
        : value(a).localeCompare(value(b))
      return order.desc ? -comparison : comparison
    })
  }, [rows, sorting])
  const selectedIndex = orderedRows.findIndex((row) => row.id === selected?.id)
  function inspect(row: Transaction) {
    setSelected(row)
    setCopied(false)
    setCopyFailed(false)
  }
  function changeSort(value: string) {
    setSorting([
      {
        id: value.startsWith('amount') ? 'amount' : 'created_at',
        desc: value === 'newest' || value === 'amount_desc',
      },
    ])
  }
  const money = (value: string, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
      Number(value),
    )
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value))
  const columns: ColumnDef<Transaction>[] = [
    {
      id: 'select',
      size: 40,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          aria-label={t('selectPage')}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t('selectRow', { reference: row.original.platform_reference_id })}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ),
    },
    {
      accessorKey: 'platform_reference_id',
      size: 220,
      header: t('reference'),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => inspect(row.original)}
          className="min-h-9 whitespace-nowrap text-left font-mono text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {row.original.platform_reference_id}
        </button>
      ),
    },
    {
      accessorKey: 'external_id',
      header: t('external_id'),
      size: 240,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-sm">{row.original.external_id}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      size: 240,
      header: t('created'),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {date(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'merchant.name',
      size: 180,
      header: t('merchant'),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {row.original.merchant?.name || t('absent')}
        </span>
      ),
    },
    {
      accessorKey: 'transaction_type',
      size: 120,
      header: t('type'),
      cell: ({ row }) => t(row.original.transaction_type),
    },
    {
      accessorKey: 'status',
      size: 160,
      header: t('status'),
      cell: ({ row }) => <Status value={row.original.status} t={t} />,
    },
    {
      accessorKey: 'amount',
      size: 170,
      sortingFn: (left, right) => Number(left.original.amount) - Number(right.original.amount),
      header: t('amount'),
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-right font-medium tabular-nums">
          {money(row.original.amount, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'channel_code',
      size: 150,
      header: t('channel'),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {row.original.channel_code || t('absent')}
        </span>
      ),
    },
    {
      accessorKey: 'settlement_status',
      size: 170,
      header: t('settlement'),
      cell: ({ row }) => <Status value={row.original.settlement_status} t={t} />,
    },
    {
      accessorKey: 'environment',
      size: 130,
      header: t('environment'),
      cell: ({ row }) => <span className="text-sm">{row.original.environment}</span>,
    },
    ...(['fee_amount', 'net_amount'] as const).map(
      (key) =>
        ({
          accessorKey: key,
          header: t(key === 'fee_amount' ? 'fee' : 'net'),
          size: 170,
          sortingFn: (left, right) =>
            Number(left.original[key] ?? 0) - Number(right.original[key] ?? 0),
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-right text-sm tabular-nums">
              {row.original[key] == null
                ? t('absent')
                : money(row.original[key], row.original.currency)}
            </div>
          ),
        }) satisfies ColumnDef<Transaction>,
    ),
    ...(['customer_name', 'customer_email'] as const).map(
      (key) =>
        ({
          accessorKey: key,
          header: t(key),
          size: 200,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-sm">{row.original[key] || t('absent')}</span>
          ),
        }) satisfies ColumnDef<Transaction>,
    ),
    ...(['paid_at', 'expired_at'] as const).map(
      (key) =>
        ({
          accessorKey: key,
          header: t(key),
          size: 240,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-sm tabular-nums">
              {row.original[key] ? date(row.original[key]) : t('absent')}
            </span>
          ),
        }) satisfies ColumnDef<Transaction>,
    ),
  ]

  const columnOrder = [
    'select',
    'platform_reference_id',
    'created_at',
    'external_id',
    'merchant.name',
    'status',
    'amount',
    'channel_code',
    'settlement_status',
    'transaction_type',
    'fee_amount',
    'net_amount',
    'customer_name',
    'environment',
  ]
  columns.sort((a, b) => {
    const position = (column: ColumnDef<Transaction>) => {
      const index = columnOrder.indexOf(
        'accessorKey' in column ? String(column.accessorKey) : (column.id ?? ''),
      )
      return index < 0 ? 99 : index
    }
    return position(a) - position(b)
  })
  const tableColumns: ColumnDef<Transaction>[] = columns.map((column, index) => {
    const title = column.header
    return typeof title === 'string' && title
      ? {
          ...column,
          id:
            column.id ??
            ('accessorKey' in column
              ? String(column.accessorKey).replaceAll('.', '_')
              : `column-${index}`),
          meta: { label: title },
          header: ({
            column: current,
          }: {
            column: import('@tanstack/react-table').Column<Transaction>
          }) => (
            <div
              className={
                ['amount', 'fee_amount', 'net_amount'].includes(current.id)
                  ? 'flex justify-end'
                  : undefined
              }
            >
              <DataTableColumnHeader column={current} title={title} />
            </div>
          ),
        }
      : column
  })

  const savedViewsControl = (
    <WorkspaceSavedViews
      label={t('savedViews')}
      hint={t('savedViewsHint')}
      defaultViewLabel={t('defaultView')}
      views={views}
      activeViewId={activeViewId}
      onSaveNew={() => setSaveOpen(true)}
      onSelect={(view) => {
        const saved = views.find((item) => item.id === view?.id)
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
      onSetDefault={(view) =>
        setViews((previous) =>
          previous.map((item) => ({ ...item, is_default: item.id === view.id })),
        )
      }
      onDelete={(view) => {
        setViews((previous) => previous.filter((item) => item.id !== view.id))
        if (activeViewId === view.id) setActiveViewId(null)
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
              onClick={() => downloadMockCSV(rows)}
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
            onSelect: (ids) => downloadMockCSV(rows.filter((row) => ids.includes(row.id))),
          },
        ]}
      />
      <SaveViewDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        isPending={false}
        onSubmit={({ name, isDefault }) => {
          const id = crypto.randomUUID()
          setViews((previous) => [
            ...previous.map((view) => (isDefault ? { ...view, is_default: false } : view)),
            {
              id,
              name,
              is_default: isDefault,
              filter: structuredClone(filter),
              search: filters.search,
              sort,
              sorting: structuredClone(sorting),
              visibility: { ...columnVisibility },
              pinning: structuredClone(columnPinning),
              density,
              tab,
            },
          ])
          setActiveViewId(id)
          setSaveOpen(false)
        }}
      />
      {bulkRequest && (
        <BulkActionDialog request={bulkRequest} onClose={() => setBulkRequest(null)} />
      )}
      <DataTableSidePanel
        title={t('detailTitle')}
        description={t('description')}
        size="xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIndex <= 0}
              onClick={() => {
                const row = orderedRows[selectedIndex - 1]
                if (row) inspect(row)
              }}
            >
              <ArrowLeftIcon className="size-4" />
              {t('previousTransaction')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIndex < 0 || selectedIndex >= orderedRows.length - 1}
              onClick={() => {
                const row = orderedRows[selectedIndex + 1]
                if (row) inspect(row)
              }}
            >
              {t('nextTransaction')}
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        }
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        {selected && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <p className="break-all font-mono text-sm font-medium">
                {selected.platform_reference_id}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selected.platform_reference_id)
                    setCopied(true)
                    setCopyFailed(false)
                  } catch {
                    setCopyFailed(true)
                  }
                }}
              >
                <CopyIcon className="size-3.5" />
                {t(copied ? 'copied' : 'copyReference')}
              </Button>
              <p role="status" className="text-xs text-muted-foreground">
                {copyFailed ? t('copyFailed') : copied ? t('copied') : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Status value={selected.status} t={t} />
              <span className="text-sm">{selected.environment}</span>
            </div>
            <p className="text-3xl font-semibold tabular-nums">
              {money(selected.amount, selected.currency)}
            </p>
            {[
              {
                title: 'identity',
                values: [
                  ['id', selected.id],
                  ['external_id', selected.external_id],
                  ['platform_reference_id', selected.platform_reference_id],
                  [
                    'tenant',
                    selected.tenant ? `${selected.tenant.name} (${selected.tenant.code})` : null,
                  ],
                  [
                    'merchant',
                    selected.merchant
                      ? `${selected.merchant.name} (${selected.merchant.code})`
                      : null,
                  ],
                ],
              },
              {
                title: 'payment',
                values: [
                  ['type', t(selected.transaction_type)],
                  ['channel', selected.channel?.name || selected.channel_code],
                  ['issuer', selected.issuer?.name],
                  ['amount', money(selected.amount, selected.currency)],
                  ['fee', money(selected.fee_amount, selected.currency)],
                  [
                    'net',
                    selected.net_amount == null
                      ? null
                      : money(selected.net_amount, selected.currency),
                  ],
                  ['settlement', t(selected.settlement_status)],
                  ['descriptionField', selected.description],
                  ['payment_code', selected.payment_code],
                  ['payment_url', selected.payment_url],
                ],
              },
              {
                title: 'customer',
                values: [
                  ['customer_name', selected.customer_name],
                  ['customer_email', selected.customer_email],
                ],
              },
              {
                title: 'timestamps',
                values: (
                  ['created_at', 'updated_at', 'paid_at', 'expired_at', 'failed_at'] as const
                ).map((key) => [key, selected[key] ? date(selected[key]) : null]),
              },
              ...(selected.failure_code || selected.failure_message
                ? [
                    {
                      title: 'failure',
                      values: [
                        ['failure_code', selected.failure_code],
                        ['failure_message', selected.failure_message],
                      ],
                    },
                  ]
                : []),
            ].map((section) => (
              <section key={section.title} className="border-t pt-5">
                <h3 className="text-sm font-semibold">{t(section.title)}</h3>
                <dl className="mt-3 space-y-3">
                  {section.values.map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[150px_1fr]"
                    >
                      <dt className="text-muted-foreground">{t(key!)}</dt>
                      <dd className="min-w-0 break-words [overflow-wrap:anywhere]">
                        {value || t('absent')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <Button variant="outline" className="min-h-11 w-full" onClick={() => setSelected(null)}>
              {t('close')}
            </Button>
          </div>
        )}
      </DataTableSidePanel>
    </>
  )
}
