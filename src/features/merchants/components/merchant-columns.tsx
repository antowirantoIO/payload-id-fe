'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { selectColumn } from '@/components/shared/data-table/select-column'
import { SemanticStatus } from '@/components/shared/semantic-status'
import { Link } from '@/i18n/navigation'
import type { Merchant } from '../lib/model'

const fields = [
  'code',
  'created_at',
  'name',
  'tenant',
  'status',
  'tier',
  'business_type',
  'business_category',
  'city',
  'settlement_mode',
  'settlement_schedule',
  'is_sandbox',
  'legal_name',
  'updated_at',
] as const
export const buildMerchantColumns = (
  t: (key: string, values?: Record<string, string>) => string,
): ColumnDef<Merchant>[] => [
  selectColumn<Merchant>({
    pageLabel: t('selectPage'),
    rowLabel: (row: Merchant) => t('selectRow', { code: row.code }),
    label: t('selection'),
    enableResizing: true,
  }),
  ...fields.map(
    (key) =>
      ({
        accessorKey: key,
        size:
          key === 'code'
            ? 220
            : key.endsWith('_at')
              ? 240
              : ['name', 'tenant', 'legal_name'].includes(key)
                ? 220
                : 160,
        meta: { label: t(`fields.${key}`) },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t(`fields.${key}`)} />
        ),
        cell: ({ row }) =>
          key === 'code' ? (
            <Link
              href={`/merchants/${row.original.id}`}
              className="inline-flex min-h-9 items-center whitespace-nowrap text-left font-mono text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {row.original.code}
            </Link>
          ) : key === 'status' ? (
            <SemanticStatus
              label={t(`statuses.${row.original.status}`)}
              tone={
                row.original.status === 'ACTIVE'
                  ? 'success'
                  : ['SUSPENDED', 'REJECTED', 'TERMINATED'].includes(row.original.status)
                    ? 'danger'
                    : ['PENDING_KYC', 'PENDING_APPROVAL'].includes(row.original.status)
                      ? 'warning'
                      : 'neutral'
              }
            />
          ) : (
            <span
              className={`whitespace-nowrap text-sm ${key.endsWith('_at') ? 'tabular-nums' : ''}`}
            >
              {key === 'is_sandbox'
                ? row.original.is_sandbox
                  ? t('environments.sandbox')
                  : t('environments.production')
                : key.endsWith('_at')
                  ? row.original[key].replace('T', ' ').slice(0, 19)
                  : row.original[key] || t('notProvided')}
            </span>
          ),
      }) satisfies ColumnDef<Merchant>,
  ),
]
