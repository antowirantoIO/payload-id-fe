import type { NextRequest } from 'next/server'
import { merchantListSchema, type MerchantListQuery } from '@/features/merchants/contracts'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'

export async function GET(request: NextRequest) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })

  const query = request.nextUrl.searchParams
  const params = new URLSearchParams()
  for (const key of ['page', 'per_page', 'status', 'tier', 'search', 'tenant_id', 'business_category']) {
    const value = query.get(key)
    if (value) params.set(key, value)
  }

  try {
    const upstream = await iamRequest(`/merchants?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!upstream.ok) {
      return Response.json(
        { code: 'MERCHANTS_UNAVAILABLE' },
        { status: upstream.status === 401 ? 401 : upstream.status === 403 ? 403 : 502 },
      )
    }
    const body = await upstream.json()
    const result = merchantListSchema.parse({
      items: body.data ?? [],
      pagination: body.pagination,
    })
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ code: 'MERCHANTS_UNAVAILABLE' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })

  try {
    const payload = await request.json()
    const upstream = await iamRequest('/merchants', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token.backendToken}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
    })
    const body = await upstream.json().catch(() => ({}))
    return Response.json(body, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ code: 'MERCHANT_CREATE_FAILED' }, { status: 502 })
  }
}

export type { MerchantListQuery }
