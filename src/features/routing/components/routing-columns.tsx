'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { useTranslations } from 'next-intl'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { selectColumn } from '@/components/shared/data-table/select-column'
import { SemanticStatus } from '@/components/shared/semantic-status'
import { compareRoutingAmounts, type RoutingRecord } from '../schemas/contracts'

const fields = [
  'issuer_channel_code',
  'provider_name',
  'channel_name',
  'merchant_scope',
  'status',
  'min_amount',
  'max_amount',
  'default_expiry_minutes',
  'updated',
] as const
export function buildRoutingColumns(
  t: ReturnType<typeof useTranslations<'routing'>>,
  inspect: (row: RoutingRecord) => void,
): ColumnDef<RoutingRecord>[] {
  return [
    selectColumn<RoutingRecord>({
      pageLabel: t('selectPage'),
      rowLabel: (row) => t('selectRow', { code: row.issuer_channel_code }),
    }),
    ...fields.map((key): ColumnDef<RoutingRecord> => ({
      accessorKey: key,
      size: key === 'issuer_channel_code' || key === 'merchant_scope' ? 220 : 170,
      meta: { label: t(key) },
      sortingFn: ['min_amount', 'max_amount'].includes(key)
        ? (a, b) =>
            compareRoutingAmounts(String(a.getValue(key) ?? '0'), String(b.getValue(key) ?? '0'))
        : 'auto',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t(key)} />,
      cell: ({ row }) =>
        key === 'issuer_channel_code' ? (
          <button
            type="button"
            onClick={() => inspect(row.original)}
            className="min-h-9 font-mono text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {row.original[key]}
          </button>
        ) : key === 'status' ? (
          <SemanticStatus
            label={t(row.original.status === 'ACTIVE' ? 'active' : 'inactive')}
            tone={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}
          />
        ) : (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {row.original[key] ?? t('notProvided')}
          </span>
        ),
    })),
  ]
}
