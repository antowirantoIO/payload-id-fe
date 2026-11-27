import {
  compareRoutingAmounts,
  type RoutingInput,
  type RoutingRecord,
  type RoutingStatus,
  routingInputSchema,
  routingRecordSchema,
} from '../schemas/contracts'

const providers = [
  { code: 'BCA', name: 'Bank Central Asia' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
]
const channels = [
  { code: 'VA', name: 'Virtual Account' },
  { code: 'QRIS', name: 'QRIS' },
  { code: 'EWALLET', name: 'E-wallet' },
]
const scopes = ['ALL_MERCHANTS', 'MERCHANT_GROUP_JAKARTA', 'MERCHANT_GROUP_DIGITAL']

export function makeRoutingFixtures(): RoutingRecord[] {
  return Array.from({ length: 18 }, (_, index) => {
    const provider = providers[index % providers.length]
    const channel = channels[index % channels.length]
    const at = new Date(Date.UTC(2026, 10, 20 - index, 8, 30)).toISOString()
    return routingRecordSchema.parse({
      id: `routing-${String(index + 1).padStart(3, '0')}`,
      provider_code: provider.code,
      provider_name: provider.name,
      channel_code: channel.code,
      channel_name: channel.name,
      merchant_scope: scopes[Math.floor(index / 12) % scopes.length],
      issuer_channel_code: `${provider.code}_${channel.code}`,
      status: index % 5 === 0 ? 'INACTIVE' : 'ACTIVE',
      min_amount: index % 3 === 0 ? '10000' : undefined,
      max_amount: index % 4 === 0 ? '50000000' : undefined,
      default_expiry_minutes: channel.code === 'VA' ? '1440' : undefined,
      created: at,
      updated: at,
    })
  })
}

export function filterRouting(
  rows: RoutingRecord[],
  search: string,
  status = '',
  provider = '',
  channel = '',
) {
  const terms = search
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((term) => term.trim())
    .filter(Boolean)
  return rows.filter(
    (row) =>
      (!terms.length ||
        terms.some((term) =>
          [
            row.id,
            row.provider_code,
            row.provider_name,
            row.channel_code,
            row.channel_name,
            row.issuer_channel_code,
            row.merchant_scope,
          ].some((value) => value.toLowerCase().includes(term)),
        )) &&
      (!status || row.status === status) &&
      (!provider || row.provider_code === provider) &&
      (!channel || row.channel_code === channel),
  )
}

export function isRoutingEligible(row: RoutingRecord, amount?: string, channelCode?: string) {
  if (row.status !== 'ACTIVE' || (channelCode && row.channel_code !== channelCode)) return false
  if (!amount) return true
  if (!/^\d+(\.\d+)?$/.test(amount)) return false
  return (
    (!row.min_amount || compareRoutingAmounts(amount, row.min_amount) >= 0) &&
    (!row.max_amount || compareRoutingAmounts(amount, row.max_amount) <= 0)
  )
}

export function canSetStatus(row: RoutingRecord, status: RoutingStatus) {
  return row.status !== status
}

export function validateRoutingInput(input: RoutingInput) {
  return routingInputSchema.safeParse(input)
}

export function saveRouting(rows: RoutingRecord[], input: RoutingInput, id?: string) {
  const parsed = routingInputSchema.parse(input)
  if (
    rows.some(
      (row) =>
        row.id !== id &&
        row.provider_code.toLowerCase() === parsed.provider_code.toLowerCase() &&
        row.channel_code.toLowerCase() === parsed.channel_code.toLowerCase() &&
        row.merchant_scope.toLowerCase() === parsed.merchant_scope.toLowerCase(),
    )
  )
    throw new Error('duplicate')
  const at = new Date().toISOString()
  const saved = routingRecordSchema.parse({
    ...parsed,
    id: id ?? crypto.randomUUID(),
    created: rows.find((row) => row.id === id)?.created ?? at,
    updated: at,
  })
  return id ? rows.map((row) => (row.id === id ? saved : row)) : [saved, ...rows]
}

export function updateRoutingStatus(rows: RoutingRecord[], id: string, status: RoutingStatus) {
  return rows.map((row) =>
    row.id === id ? { ...row, status, updated: new Date().toISOString() } : row,
  )
}
export function deleteRouting(rows: RoutingRecord[], id: string) {
  return rows.filter((row) => row.id !== id)
}
export function restoreRouting(rows: RoutingRecord[], row: RoutingRecord) {
  return rows.some((item) => item.id === row.id) ? rows : [row, ...rows]
}
