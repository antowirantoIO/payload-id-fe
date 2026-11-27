import type { FieldConfig } from '@/components/shared/data-table/filters'

const providers = ['BCA', 'MANDIRI', 'GOPAY', 'OVO']
const channels = ['VA', 'QRIS', 'EWALLET']
export const routingFields: FieldConfig[] = [
  ...(
    [
      'id',
      'provider_code',
      'provider_name',
      'channel_code',
      'channel_name',
      'issuer_channel_code',
      'merchant_scope',
    ] as const
  ).map((id) => ({ id, label: id.replaceAll('_', ' '), type: 'text' as const })),
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    options: ['ACTIVE', 'INACTIVE'].map((value) => ({ value, label: value })),
  },
  {
    id: 'provider_code',
    label: 'Provider',
    type: 'enum',
    options: providers.map((value) => ({ value, label: value })),
  },
  {
    id: 'channel_code',
    label: 'Channel',
    type: 'enum',
    options: channels.map((value) => ({ value, label: value })),
  },
  { id: 'created', label: 'Created (UTC)', type: 'date', includeTime: true },
  { id: 'updated', label: 'Updated (UTC)', type: 'date', includeTime: true },
]
export const routingSortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]
