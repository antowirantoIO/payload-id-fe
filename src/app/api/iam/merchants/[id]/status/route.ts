import type { NextRequest } from 'next/server'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  const { id } = await params

  try {
    const { status, reason } = await request.json()
    const upstream = await iamRequest(`/merchants/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    const body = await upstream.json().catch(() => ({}))
    return Response.json(body, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ code: 'MERCHANT_STATUS_FAILED' }, { status: 502 })
  }
}
