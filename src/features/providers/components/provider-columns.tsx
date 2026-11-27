'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { useTranslations } from 'next-intl'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { selectColumn } from '@/components/shared/data-table/select-column'
import { SemanticStatus } from '@/components/shared/semantic-status'
import { healthTone, type Provider, providerHost, statusTone } from '../lib/model'

export function buildProviderColumns(
  t: ReturnType<typeof useTranslations<'providers'>>,
  inspect: (row: Provider) => void,
): ColumnDef<Provider>[] {
  const fields = ['code', 'name', 'base_url', 'status', 'health_status', 'updated_at'] as const
  const labels = {
    code: t('code'),
    name: t('name'),
    base_url: t('baseUrl'),
    status: t('status'),
    health_status: t('health'),
    updated_at: t('updatedAt'),
  }
  return [
    selectColumn<Provider>({
      pageLabel: t('selectPage'),
      rowLabel: (row) => t('selectRow', { code: row.code }),
    }),
    ...fields.map((key): ColumnDef<Provider> => ({
      accessorKey: key,
      size: key === 'base_url' ? 250 : 180,
      meta: { label: labels[key] },
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels[key]} />,
      cell: ({ row }) =>
        key === 'code' ? (
          <button
            type="button"
            onClick={() => inspect(row.original)}
            className="min-h-9 font-mono text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {row.original.code}
          </button>
        ) : key === 'status' ? (
          <SemanticStatus
            label={t(
              row.original.status === 'ACTIVE'
                ? 'active'
                : row.original.status === 'MAINTENANCE'
                  ? 'maintenance'
                  : 'inactive',
            )}
            tone={statusTone(row.original.status)}
          />
        ) : key === 'health_status' ? (
          <SemanticStatus
            label={t(
              row.original.health_status === 'HEALTHY'
                ? 'healthy'
                : row.original.health_status === 'DEGRADED'
                  ? 'degraded'
                  : row.original.health_status === 'DOWN'
                    ? 'unavailable'
                    : 'untested',
            )}
            tone={healthTone(row.original.health_status)}
          />
        ) : (
          <span className="whitespace-nowrap text-sm">
            {key === 'base_url' ? providerHost(row.original.base_url) : row.original[key]}
          </span>
        ),
    })),
  ]
}
