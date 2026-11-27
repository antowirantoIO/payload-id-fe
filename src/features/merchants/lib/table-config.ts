import type { FieldConfig } from '@/components/shared/data-table/filters'
import { businessTypes, statuses, tenants, tiers } from './model'

export const buildMerchantFields = (t: (key: string) => string): FieldConfig[] => [
  ...(['code', 'name', 'legal_name', 'city', 'business_category'] as const).map((id) => ({
    id,
    label: {
      code: t('fields.code'),
      name: t('fields.name'),
      legal_name: t('fields.legal_name'),
      city: t('fields.city'),
      business_category: t('fields.business_category'),
    }[id],
    type: 'text' as const,
  })),
  ...(
    [
      { id: 'status', label: t('fields.status'), values: statuses },
      { id: 'tier', label: t('fields.tier'), values: tiers },
      { id: 'tenant', label: t('fields.tenant'), values: tenants },
      { id: 'business_type', label: t('fields.business_type'), values: businessTypes },
      { id: 'environment', label: t('fields.is_sandbox'), values: ['sandbox', 'production'] },
      { id: 'settlement_mode', label: t('fields.settlement_mode'), values: ['BANK', 'WALLET'] },
    ] as const
  ).map(({ id, label, values }) => ({
    id,
    label,
    type: 'enum' as const,
    options: values.map((value) => ({
      value,
      label:
        id === 'environment'
          ? t(`environments.${value}`)
          : id === 'status'
            ? t(`statuses.${value}`)
            : value.replaceAll('_', ' '),
    })),
  })),
  { id: 'created_at', label: t('fields.created_at'), type: 'date', includeTime: true },
  { id: 'updated_at', label: t('fields.updated_at'), type: 'date', includeTime: true },
]
export const buildMerchantSortOptions = (t: (key: string) => string) => [
  { value: 'newest', label: t('sort.newest') },
  { value: 'oldest', label: t('sort.oldest') },
  { value: 'name_asc', label: t('sort.name_asc') },
  { value: 'name_desc', label: t('sort.name_desc') },
]
