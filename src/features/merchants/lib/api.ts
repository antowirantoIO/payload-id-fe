import {
  type AuditEntry,
  auditListSchema,
  type MerchantListQuery,
  type MerchantRecord,
  merchantListSchema,
  merchantSchema,
  type TenantOption,
  tenantOptionsSchema,
} from '../contracts'

export class MerchantApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message?: string,
  ) {
    super(message ?? code ?? `Request failed (${status})`)
  }
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new MerchantApiError(response.status, body.code, body.message)
  }
  return body
}

export async function listMerchants(query: MerchantListQuery = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.per_page) params.set('per_page', String(query.per_page))
  if (query.status) params.set('status', query.status)
  if (query.tier) params.set('tier', query.tier)
  if (query.search) params.set('search', query.search)
  return merchantListSchema.parse(
    await request(`/api/iam/merchants?${params.toString()}`),
  )
}

export async function getMerchant(id: string): Promise<MerchantRecord> {
  return merchantSchema.parse(await request(`/api/iam/merchants/${encodeURIComponent(id)}`))
}

export async function createMerchant(input: unknown): Promise<MerchantRecord> {
  const body = await request('/api/iam/merchants', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return merchantSchema.parse(body.data)
}

export async function updateMerchant(id: string, input: unknown): Promise<MerchantRecord> {
  const body = await request(`/api/iam/merchants/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return merchantSchema.parse(body.data)
}

export async function changeMerchantStatus(id: string, status: string, reason: string) {
  return request(`/api/iam/merchants/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  })
}

export async function listTenants(): Promise<TenantOption[]> {
  return tenantOptionsSchema.parse(await request('/api/iam/tenants'))
}

export async function getMerchantActivity(id: string): Promise<AuditEntry[]> {
  return auditListSchema.parse(
    await request(`/api/iam/merchants/${encodeURIComponent(id)}/activity`),
  )
}
