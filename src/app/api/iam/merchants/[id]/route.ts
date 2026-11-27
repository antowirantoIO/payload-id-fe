import type { NextRequest } from 'next/server'
import { merchantSchema } from '@/features/merchants/contracts'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  const { id } = await params

  try {
    const upstream = await iamRequest(`/merchants/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!upstream.ok) {
      return Response.json(
        { code: 'MERCHANT_UNAVAILABLE' },
        {
          status:
            upstream.status === 401
              ? 401
              : upstream.status === 404
                ? 404
                : upstream.status === 403
                  ? 403
                  : 502,
        },
      )
    }
    const body = await upstream.json()
    const merchant = merchantSchema.parse(body.data)
    return Response.json(merchant, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ code: 'MERCHANT_UNAVAILABLE' }, { status: 502 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  const { id } = await params

  try {
    const payload = await request.json()
    const upstream = await iamRequest(`/merchants/${encodeURIComponent(id)}`, {
      method: 'PUT',
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
    return Response.json({ code: 'MERCHANT_UPDATE_FAILED' }, { status: 502 })
  }
}
