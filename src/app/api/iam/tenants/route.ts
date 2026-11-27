import type { NextRequest } from 'next/server'
import { tenantOptionsSchema } from '@/features/merchants/contracts'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'

export async function GET(request: NextRequest) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })

  try {
    const upstream = await iamRequest('/tenants?per_page=100', {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!upstream.ok) {
      return Response.json(
        { code: 'TENANTS_UNAVAILABLE' },
        { status: upstream.status === 401 ? 401 : 502 },
      )
    }
    const body = await upstream.json()
    return Response.json(tenantOptionsSchema.parse(body.data ?? []), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ code: 'TENANTS_UNAVAILABLE' }, { status: 502 })
  }
}
