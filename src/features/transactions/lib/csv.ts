import type { Transaction } from '../contracts'

export function serializeTransactionsCSV(rows: Transaction[]): string {
  const fields = [
    'id',
    'external_id',
    'platform_reference_id',
    'transaction_type',
    'status',
    'amount',
    'currency',
    'fee_amount',
    'net_amount',
    'channel_code',
    'settlement_status',
    'environment',
    'created_at',
  ] as const
  const quoteCSV = (value: string) => `"${value.replaceAll('"', '""')}"`
  return (
    '\uFEFF' +
    [
      fields.join(','),
      ...rows.map((row) => fields.map((key) => quoteCSV(row[key] ?? '')).join(',')),
    ].join('\r\n')
  )
}
