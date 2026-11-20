import type { FieldConfig } from '@/components/shared/data-table/filters'
import { businessTypes, statuses, tenants, tiers } from './model'

export const merchantFields: FieldConfig[] = [
  ...(['code', 'name', 'legal_name', 'city', 'business_category'] as const).map((id) => ({
    id,
    label: {
      code: 'Merchant code',
      name: 'Business name',
      legal_name: 'Legal name',
      city: 'City',
      business_category: 'Category',
    }[id],
    type: 'text' as const,
  })),
  ...(
    [
      { id: 'status', label: 'Status', values: statuses },
      { id: 'tier', label: 'Tier', values: tiers },
      { id: 'tenant', label: 'Tenant', values: tenants },
      { id: 'business_type', label: 'Business type', values: businessTypes },
      { id: 'environment', label: 'Environment', values: ['Sandbox', 'Production'] },
      { id: 'settlement_mode', label: 'Settlement mode', values: ['BANK', 'WALLET'] },
    ] as const
  ).map(({ id, label, values }) => ({
    id,
    label,
    type: 'enum' as const,
    options: values.map((value) => ({ value, label: value.replaceAll('_', ' ') })),
  })),
  { id: 'created_at', label: 'Created (UTC)', type: 'date', includeTime: true },
  { id: 'updated_at', label: 'Updated (UTC)', type: 'date', includeTime: true },
]
export const merchantSortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name_asc', label: 'Business name A–Z' },
  { value: 'name_desc', label: 'Business name Z–A' },
]
