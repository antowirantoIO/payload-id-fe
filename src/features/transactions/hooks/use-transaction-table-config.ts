'use client'

import { useTranslations } from 'next-intl'
import type { FieldConfig } from '@/components/shared/data-table/filters'
import { transactionStatuses } from '../contracts'

export function useTransactionTableConfig() {
  const t = useTranslations('transactions')
  const fields: FieldConfig[] = [
    { id: 'platform_reference_id', label: t('reference'), type: 'text' },
    { id: 'external_id', label: t('external_id'), type: 'text' },
    {
      id: 'status',
      label: t('status'),
      type: 'enum',
      options: transactionStatuses.map((value) => ({ value, label: t(value) })),
    },
    {
      id: 'transaction_type',
      label: t('type'),
      type: 'enum',
      options: ['PAYIN', 'PAYOUT'].map((value) => ({ value, label: t(value) })),
    },
    {
      id: 'environment',
      label: t('environment'),
      type: 'enum',
      options: ['SANDBOX', 'LIVE'].map((value) => ({ value, label: value })),
    },
    {
      id: 'channel_code',
      label: t('channel'),
      type: 'enum',
      options: ['BCA_VA', 'QRIS', 'BANK_TRANSFER'].map((value) => ({ value, label: value })),
    },
    { id: 'amount', label: t('amount'), type: 'number' },
    ...(['created_at', 'paid_at', 'expired_at'] as const).map((id) => ({
      id,
      label: t(id === 'created_at' ? 'created' : id),
      type: 'date' as const,
      includeTime: true,
    })),
    {
      id: 'settlement_status',
      label: t('settlement'),
      type: 'enum',
      options: ['UNSETTLED', 'SETTLED', 'PARTIAL_SETTLED'].map((value) => ({
        value,
        label: t(value),
      })),
    },
  ]
  return {
    fields,
    quickFields: ['status', 'channel_code'],
    sortOptions: ['newest', 'oldest', 'amount_desc', 'amount_asc'].map((value) => ({
      value,
      label: t(value),
    })),
  }
}
