'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { Checkbox } from '@/components/ui/checkbox'
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
const labels: Record<(typeof fields)[number], string> = {
  code: 'Merchant code',
  created_at: 'Created (UTC)',
  name: 'Business name',
  tenant: 'Tenant',
  status: 'Status',
  tier: 'Tier',
  business_type: 'Business type',
  business_category: 'Category',
  city: 'City',
  settlement_mode: 'Settlement mode',
  settlement_schedule: 'Schedule',
  is_sandbox: 'Environment',
  legal_name: 'Legal name',
  updated_at: 'Updated (UTC)',
}

export const merchantColumns: ColumnDef<Merchant>[] = [
  {
    id: 'select',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all merchants on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.code}`}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      />
    ),
  },
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
        meta: { label: labels[key] },
        header: ({ column }) => <DataTableColumnHeader column={column} title={labels[key]} />,
        cell: ({ row }) =>
          key === 'code' ? (
            <Link
              href={`/merchants/${row.original.id}`}
              className="inline-flex min-h-9 items-center whitespace-nowrap text-left font-mono text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {row.original.code}
            </Link>
          ) : key === 'status' ? (
            <span
              className={`inline-flex whitespace-nowrap rounded-sm border px-2 py-1 text-xs font-medium ${row.original.status === 'ACTIVE' ? 'border-emerald-700/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : ['SUSPENDED', 'REJECTED', 'TERMINATED'].includes(row.original.status) ? 'border-red-700/20 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' : 'border-border bg-muted text-foreground'}`}
            >
              {row.original.status.replaceAll('_', ' ')}
            </span>
          ) : (
            <span
              className={`whitespace-nowrap text-sm ${key.endsWith('_at') ? 'tabular-nums' : ''}`}
            >
              {key === 'is_sandbox'
                ? row.original.is_sandbox
                  ? 'Sandbox'
                  : 'Production'
                : key.endsWith('_at')
                  ? row.original[key].replace('T', ' ').slice(0, 19)
                  : row.original[key] || 'Not provided'}
            </span>
          ),
      }) satisfies ColumnDef<Merchant>,
  ),
]
