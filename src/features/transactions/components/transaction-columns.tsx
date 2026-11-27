import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { selectColumn } from '@/components/shared/data-table/select-column'
import type { Transaction } from '../contracts'
import type { TransactionFormatters } from '../lib/format'
import { type TransactionCopy, TransactionStatus } from './transaction-status'

export function createTransactionColumns({
  t,
  money,
  date,
  inspect,
}: TransactionFormatters & {
  t: TransactionCopy
  inspect: (row: Transaction) => void
}): ColumnDef<Transaction>[] {
  const columns: ColumnDef<Transaction>[] = [
    selectColumn<Transaction>({
      pageLabel: t('selectPage'),
      rowLabel: (row) => t('selectRow', { reference: row.platform_reference_id }),
      enableResizing: true,
    }),
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
      cell: ({ row }) => <TransactionStatus value={row.original.status} t={t} />,
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
      cell: ({ row }) => <TransactionStatus value={row.original.settlement_status} t={t} />,
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
  return tableColumns
}
