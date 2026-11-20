import { type Transaction, transactionSchema } from '../contracts'

const statuses = [
  'PAID',
  'PENDING',
  'FAILED',
  'SETTLED',
  'EXPIRED',
  'CREATED',
  'REFUNDED',
  'PARTIAL_REFUNDED',
  'PROCESSING',
  'SUCCESS',
  'PENDING_APPROVAL',
  'REFUND_PENDING',
  'REFUND_FAILED',
] as const
const channels = [
  {
    id: 'mock-channel-va',
    code: 'BCA_VA',
    name: 'BCA Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
  },
  { id: 'mock-channel-qris', code: 'QRIS', name: 'QRIS', category: 'QRIS' },
  {
    id: 'mock-channel-transfer',
    code: 'BANK_TRANSFER',
    name: 'Bank transfer',
    category: 'BANK_TRANSFER',
  },
]

export const mockTransactions: Transaction[] = Array.from({ length: 36 }, (_, index) => {
  const number = index + 1
  const status = statuses[index % statuses.length]
  const payout = ['PROCESSING', 'SUCCESS', 'PENDING_APPROVAL'].includes(status)
  const channel = channels[payout ? 2 : index % 2]
  const created = new Date(
    Date.UTC(2026, 10, 14 - Math.floor(index / 8), 10, 45 - index),
  ).toISOString()
  const paid = [
    'PAID',
    'SETTLED',
    'REFUNDED',
    'PARTIAL_REFUNDED',
    'REFUND_PENDING',
    'REFUND_FAILED',
    'SUCCESS',
  ].includes(status)
  const amount = 125000 + index * 27500
  return transactionSchema.parse({
    id: `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`,
    tenant: {
      id: 'mock-tenant',
      code: 'DEMO_RESELLER',
      name: 'Reseller',
      type: 'RESELLER',
      status: 'ACTIVE',
    },
    merchant: {
      id: `mock-merchant-${index % 3}`,
      code: `DEMO_${(index % 3) + 1}`,
      name: `Merchant ${(index % 3) + 1}`,
    },
    issuer: { id: 'mock-issuer', code: 'PROVIDER', name: 'Payment Provider' },
    channel,
    transaction_type: payout ? 'PAYOUT' : 'PAYIN',
    status,
    external_id: `DEMO-ORDER-${String(number).padStart(5, '0')}`,
    platform_reference_id: `DEMO-PAY-${String(number).padStart(7, '0')}`,
    channel_code: channel.code,
    amount: `${amount}.00`,
    currency: 'IDR',
    fee_amount: '2500.00',
    net_amount: paid ? `${amount - 2500}.00` : undefined,
    description: `Payment for order ${number}`,
    customer_name: `Customer ${number}`,
    customer_email: `customer${number}@example.com`,
    payment_code: payout ? undefined : `880000${String(number).padStart(8, '0')}`,
    payment_url: payout ? undefined : `https://example.com/payments/${number}`,
    settlement_status:
      status === 'SETTLED'
        ? 'SETTLED'
        : status === 'PARTIAL_REFUNDED'
          ? 'PARTIAL_SETTLED'
          : 'UNSETTLED',
    expired_at: payout ? undefined : new Date(Date.parse(created) + 86400000).toISOString(),
    paid_at: paid ? new Date(Date.parse(created) + 120000).toISOString() : undefined,
    failed_at:
      status === 'FAILED' ? new Date(Date.parse(created) + 60000).toISOString() : undefined,
    failure_code: status === 'FAILED' ? 'PROVIDER_ERROR' : undefined,
    failure_message: status === 'FAILED' ? 'Payment rejected by provider.' : undefined,
    environment: index % 4 === 0 ? 'LIVE' : 'SANDBOX',
    created_at: created,
    updated_at: paid ? new Date(Date.parse(created) + 120000).toISOString() : created,
  })
})

export type TransactionFilters = {
  search: string
  status: string
  type: string
  channel: string
  environment: string
  start: string
  end: string
  minimum: string
  maximum: string
}
export const emptyFilters: TransactionFilters = {
  search: '',
  status: '',
  type: '',
  channel: '',
  environment: '',
  start: '',
  end: '',
  minimum: '',
  maximum: '',
}

export function filterTransactions(rows: Transaction[], filters: TransactionFilters) {
  const terms = [
    ...new Set(
      filters.search
        .split(/[,;\n]+/)
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
  return rows.filter(
    (row) =>
      (!terms.length ||
        terms.some((search) =>
          [
            row.id,
            row.external_id,
            row.platform_reference_id,
            row.customer_name,
            row.customer_email,
          ].some((value) => value?.toLowerCase().includes(search)),
        )) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.type || row.transaction_type === filters.type) &&
      (!filters.channel || row.channel_code === filters.channel) &&
      (!filters.environment || row.environment === filters.environment) &&
      (!filters.start || row.created_at.slice(0, 10) >= filters.start) &&
      (!filters.end || row.created_at.slice(0, 10) <= filters.end) &&
      (!filters.minimum || Number(row.amount) >= Number(filters.minimum)) &&
      (!filters.maximum || Number(row.amount) <= Number(filters.maximum)),
  )
}

export async function loadMockTransactions(signal: AbortSignal, fail: boolean) {
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, 350)
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })
  if (fail) throw new Error('Simulated transaction request failure')
  return mockTransactions
}
