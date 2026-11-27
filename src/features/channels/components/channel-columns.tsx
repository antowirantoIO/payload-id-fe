'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { useTranslations } from 'next-intl'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { selectColumn } from '@/components/shared/data-table/select-column'
import { SemanticStatus } from '@/components/shared/semantic-status'
import type { Channel } from '../lib/model'

export function buildChannelColumns(
  t: ReturnType<typeof useTranslations<'channels'>>,
  inspect: (channel: Channel) => void,
): ColumnDef<Channel>[] {
  const fields = [
    'code',
    'name',
    'category',
    'direction',
    'currency',
    'status',
    'provider_name',
    'updated_at',
  ] as const
  return [
    selectColumn<Channel>({
      pageLabel: t('selectPage'),
      rowLabel: (row) => t('selectRow', { code: row.code }),
    }),
    ...fields.map((key): ColumnDef<Channel> => ({
      accessorKey: key,
      size: key === 'name' ? 230 : 170,
      meta: {
        label: t(key === 'provider_name' ? 'provider' : key === 'updated_at' ? 'updated' : key),
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(key === 'provider_name' ? 'provider' : key === 'updated_at' ? 'updated' : key)}
        />
      ),
      cell: ({ row }) =>
        key === 'status' ? (
          <SemanticStatus
            label={t(`statuses.${row.original.status}`)}
            tone={
              row.original.status === 'ACTIVE'
                ? 'success'
                : row.original.status === 'MAINTENANCE'
                  ? 'warning'
                  : 'neutral'
            }
          />
        ) : key === 'code' ? (
          <button
            type="button"
            onClick={() => inspect(row.original)}
            className="min-h-9 font-mono text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {row.original.code}
          </button>
        ) : (
          <span className="whitespace-nowrap text-sm">
            {key === 'category'
              ? t(`categories.${row.original.category}`)
              : key === 'direction'
                ? t(`directions.${row.original.direction}`)
                : (row.original[key] ?? t('noProvider'))}
          </span>
        ),
    })),
  ]
}
