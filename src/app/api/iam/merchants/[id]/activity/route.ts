import type { NextRequest } from 'next/server'
import { auditListSchema } from '@/features/merchants/contracts'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  const { id } = await params

  try {
    const upstream = await iamRequest(
      `/audit-logs?entity_type=merchant&entity_id=${encodeURIComponent(id)}&per_page=100`,
      { headers: { Authorization: `Bearer ${token.backendToken}` } },
    )
    if (!upstream.ok) {
      return Response.json(
        { code: 'ACTIVITY_UNAVAILABLE' },
        { status: upstream.status === 401 ? 401 : 502 },
      )
    }
    const body = await upstream.json()
    return Response.json(auditListSchema.parse(body.data ?? []), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ code: 'ACTIVITY_UNAVAILABLE' }, { status: 502 })
  }
}
