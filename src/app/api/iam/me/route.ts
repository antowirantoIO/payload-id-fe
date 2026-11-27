import type { NextRequest } from 'next/server'
import { iamRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'
export async function GET(request: NextRequest) {
  const token = await getBackendSession(request)
  if (!token) {
    return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }
  try {
    const upstream = await iamRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!upstream.ok)
      return Response.json(
        { code: 'PROFILE_UNAVAILABLE' },
        { status: upstream.status === 401 ? 401 : 502 },
      )
    return Response.json(await upstream.json(), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ code: 'UPSTREAM_UNAVAILABLE' }, { status: 502 })
  }
}
