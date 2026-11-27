import {
  type Payout,
  type PayoutFilters,
  type PayoutScope,
  payoutListSchema,
  payoutSchema,
} from '../contracts'

const statuses = [
  'CREATED',
  'PENDING_APPROVAL',
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'SETTLED',
] as const
const banks = [
  ['BCA', 'Bank Central Asia'],
  ['BNI', 'Bank Negara Indonesia'],
  ['BRI', 'Bank Rakyat Indonesia'],
  ['MANDIRI', 'Bank Mandiri'],
] as const

export const mockPayouts: Payout[] = payoutListSchema.parse(
  Array.from({ length: 35 }, (_, index) => {
    const number = index + 1
    const status = statuses[index % statuses.length]
    const [bankCode, bankName] = banks[index % banks.length]
    const created = new Date(
      Date.UTC(2026, 10, 14 - Math.floor(index / 8), 10, 45 - index),
    ).toISOString()
    const amount = `${125000 + index * 27500}.00`
    const netAmount = `${125000 + index * 27500 - 2500}.00`
    const completed = status === 'SUCCESS' || status === 'SETTLED'
    const failed = status === 'FAILED'
    return payoutSchema.parse({
      id: `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`,
      tenant: {
        id: `tenant-${index % 2}`,
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
      issuer: {
        id: 'mock-issuer',
        code: index % 2 ? 'BILLER' : 'ISSUER',
        name: index % 2 ? 'Biller Network' : 'Issuer Network',
      },
      channel: {
        id: 'mock-channel',
        code: 'BANK_TRANSFER',
        name: 'Bank transfer',
        category: 'BANK_TRANSFER',
      },
      channel_code: 'BANK_TRANSFER',
      transaction_type: 'PAYOUT',
      status,
      external_id: `DEMO-PAYOUT-${String(number).padStart(5, '0')}`,
      platform_reference_id: `DEMO-PAY-${String(number).padStart(7, '0')}`,
      amount,
      currency: 'IDR',
      fee_amount: '2500.00',
      net_amount: netAmount,
      description: `Payout for order ${number}`,
      payout_detail: {
        payout_method: index % 3 === 0 ? 'BANK_TRANSFER' : 'VIRTUAL_ACCOUNT',
        destination_bank_code: bankCode,
        destination_bank_name: bankName,
        destination_account_number: `123456789${String(number).padStart(3, '0')}`,
        destination_account_name: `Beneficiary ${number}`,
        destination_account_verified: index % 5 !== 0,
        transfer_channel: index % 2 ? 'HOST_TO_HOST' : 'BANK_NETWORK',
        source: index % 2 ? 'BALANCE' : 'SETTLEMENT',
      },
      settlement_status: status === 'SETTLED' ? 'SETTLED' : 'UNSETTLED',
      failure_code: failed ? 'PROVIDER_ERROR' : undefined,
      failure_message: failed ? 'Transfer rejected by provider.' : undefined,
      environment: index % 4 === 0 ? 'LIVE' : 'SANDBOX',
      created_at: created,
      updated_at: created,
      paid_at: completed ? new Date(Date.parse(created) + 120000).toISOString() : undefined,
      failed_at: failed ? new Date(Date.parse(created) + 60000).toISOString() : undefined,
    })
  }),
)

export const emptyPayoutFilters: PayoutFilters = {}

function compareDecimal(left: string, right: string) {
  const [li, lf = ''] = left.split('.')
  const [ri, rf = ''] = right.split('.')
  const integer = li
    .padStart(Math.max(li.length, ri.length), '0')
    .localeCompare(ri.padStart(Math.max(li.length, ri.length), '0'))
  return (
    integer ||
    lf
      .padEnd(Math.max(lf.length, rf.length), '0')
      .localeCompare(rf.padEnd(Math.max(lf.length, rf.length), '0'))
  )
}

export function filterPayouts(rows: Payout[], filters: PayoutFilters, scope?: PayoutScope) {
  const terms = (filters.search ?? '')
    .split(/[,;\n]+/)
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
  return rows.filter((row) => {
    const searchable = [
      row.id,
      row.external_id,
      row.platform_reference_id,
      row.merchant?.name,
      row.payout_detail.destination_account_name,
    ]
    return (
      (!terms.length ||
        terms.some((term) => searchable.some((value) => value?.toLowerCase().includes(term)))) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.environment || row.environment === filters.environment) &&
      (!scope?.tenantId || row.tenant?.id === scope.tenantId) &&
      (!scope?.merchantId || row.merchant?.id === scope.merchantId) &&
      (!scope?.environment || row.environment === scope.environment) &&
      (!filters.minimum || compareDecimal(row.amount, filters.minimum) >= 0) &&
      (!filters.maximum || compareDecimal(row.amount, filters.maximum) <= 0) &&
      (!filters.start || row.created_at >= `${filters.start}T00:00:00.000Z`) &&
      (!filters.end || row.created_at <= `${filters.end}T23:59:59.999Z`)
    )
  })
}

export async function loadMockPayouts(signal: AbortSignal, fail = false, delay = 350) {
  await new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) return abort()
    timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, delay)
    signal.addEventListener('abort', abort, { once: true })
  })
  if (fail) throw new Error('Simulated payout request failure')
  return mockPayouts.map((payout) => ({ ...payout, payout_detail: { ...payout.payout_detail } }))
}
