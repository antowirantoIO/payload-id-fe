export const statuses = [
  'DRAFT',
  'PENDING_KYC',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
  'TERMINATED',
] as const
export type MerchantStatus = (typeof statuses)[number]
export const transitions: Record<MerchantStatus, MerchantStatus[]> = {
  DRAFT: ['PENDING_KYC'],
  PENDING_KYC: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['ACTIVE'],
  ACTIVE: ['SUSPENDED', 'TERMINATED'],
  SUSPENDED: ['ACTIVE', 'TERMINATED'],
  REJECTED: [],
  TERMINATED: [],
}
export const businessTypes = ['PT', 'CV', 'UD', 'INDIVIDUAL', 'YAYASAN'] as const
export const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const
export const tenants = ['Platform', 'Reseller West', 'Reseller East']
export interface Merchant {
  id: string
  tenant: string
  code: string
  name: string
  legal_name: string
  business_type: string
  business_category: string
  status: MerchantStatus
  tier: string
  address: string
  city: string
  province: string
  postal_code: string
  npwp: string
  nib: string
  website: string
  settlement_mode: string
  settlement_schedule: string
  callback_url: string
  callback_url_sandbox: string
  ip_whitelist: string
  is_sandbox: boolean
  created_at: string
  updated_at: string
  history: { at: string; message: string }[]
}
export function emptyMerchant(): Merchant {
  return {
    id: '',
    tenant: tenants[0],
    code: '',
    name: '',
    legal_name: '',
    business_type: 'PT',
    business_category: '',
    status: 'DRAFT',
    tier: 'BRONZE',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    npwp: '',
    nib: '',
    website: '',
    settlement_mode: 'BANK',
    settlement_schedule: 'H+1',
    callback_url: '',
    callback_url_sandbox: '',
    ip_whitelist: '',
    is_sandbox: true,
    created_at: '',
    updated_at: '',
    history: [],
  }
}
export function makeMerchants(): Merchant[] {
  const names = ['Retail', 'Travel', 'Education', 'Food', 'Digital', 'Services']
  return Array.from({ length: 32 }, (_, i) => {
    const at = new Date(Date.UTC(2026, 10, 14 - i, 8)).toISOString()
    return {
      ...emptyMerchant(),
      id: `demo-merchant-${i + 1}`,
      code: `DEMO-${String(i + 1).padStart(4, '0')}`,
      name: `${names[i % names.length]} ${i + 1}`,
      legal_name: `PT Business ${i + 1}`,
      tenant: tenants[i % tenants.length],
      business_category: names[i % names.length],
      status: statuses[i % statuses.length],
      tier: tiers[i % tiers.length],
      city: ['Jakarta', 'Bandung', 'Surabaya'][i % 3],
      province: ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur'][i % 3],
      is_sandbox: i % 3 === 0,
      created_at: at,
      updated_at: at,
      history: [{ at, message: 'Merchant created.' }],
    }
  })
}
export function filterMerchants(
  rows: Merchant[],
  search: string,
  status: string,
  tier: string,
  tenant: string,
  environment: string,
) {
  const terms = search
    .toLowerCase()
    .split(/[,;\n]/)
    .map((term) => term.trim())
    .filter(Boolean)
  return rows.filter(
    (row) =>
      (!terms.length ||
        terms.some((term) =>
          [row.code, row.name, row.legal_name, row.id, row.city].some((value) =>
            value.toLowerCase().includes(term),
          ),
        )) &&
      (!status || row.status === status) &&
      (!tier || row.tier === tier) &&
      (!tenant || row.tenant === tenant) &&
      (!environment || row.is_sandbox === (environment === 'sandbox')),
  )
}
export function canTransition(rows: Merchant[], target: MerchantStatus) {
  return rows.length > 0 && rows.every((row) => transitions[row.status].includes(target))
}
export function exportMerchants(rows: Merchant[]) {
  const fields = [
    'id',
    'code',
    'name',
    'legal_name',
    'tenant',
    'status',
    'tier',
    'business_type',
    'business_category',
    'city',
    'settlement_mode',
    'settlement_schedule',
    'is_sandbox',
    'created_at',
  ] as const
  const quote = (value: unknown) => {
    const text = String(value)
    return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`
  }
  return (
    '\uFEFF' +
    [
      fields.join(','),
      ...rows.map((row) => fields.map((field) => quote(row[field])).join(',')),
    ].join('\r\n')
  )
}
