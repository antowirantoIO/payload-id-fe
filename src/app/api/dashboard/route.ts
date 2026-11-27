import type { NextRequest } from 'next/server'
import { alertsSchema, summarySchema } from '@/features/account'
import { profileSchema } from '@/lib/api/contracts'
import { iamRequest, serviceRequest } from '@/lib/api/server'
import { getBackendSession } from '@/lib/auth/server-session'
import { workspaceFor } from '@/lib/auth/workspace'

export async function GET(request: NextRequest) {
  const token = await getBackendSession(request)
  if (!token) return Response.json({}, { status: 401 })
  try {
    const headers = { Authorization: `Bearer ${token.backendToken}` }
    const me = await iamRequest('/auth/me', { headers })
    if (!me.ok) return Response.json({}, { status: me.status === 401 ? 401 : 502 })
    const profile = profileSchema.parse((await me.json()).data)
    const workspace = workspaceFor(profile)
    const permission = workspace === 'merchant' ? 'transaction.read' : 'report.read'
    if (!workspace || !profile.permissions.includes(permission))
      return Response.json({}, { status: 403 })
    const base = process.env.PAYMENT_API_URL
    if (!base) return Response.json({ code: 'PAYMENT_API_NOT_CONFIGURED' }, { status: 503 })
    const path = workspace === 'platform' ? '/dashboard/alerts' : `/${workspace}/dashboard/summary`
    const response = await serviceRequest(base, path, { headers })
    if (!response.ok) return Response.json({}, { status: response.status === 403 ? 403 : 502 })
    const body = await response.json()
    const data =
      workspace === 'platform' ? alertsSchema.parse(body.data) : summarySchema.parse(body.data)
    return Response.json({ workspace, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ code: 'DASHBOARD_UNAVAILABLE' }, { status: 502 })
  }
}
