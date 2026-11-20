import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { iamRequest } from '@/lib/api/server'
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: new URL(process.env.AUTH_URL ?? request.url).protocol === 'https:',
  })
  if (!token?.backendToken || !token.backendExpires || Date.now() >= token.backendExpires) {
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
