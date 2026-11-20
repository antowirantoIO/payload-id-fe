import 'server-only'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { profileSchema } from '@/lib/api/contracts'
import { iamRequest } from '@/lib/api/server'

export async function getServerProfile() {
  const request = new NextRequest(process.env.AUTH_URL ?? 'http://localhost:3000', {
    headers: await headers(),
  })
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === 'https:',
  })
  if (!token?.backendToken || !token.backendExpires || token.backendExpires <= Date.now())
    return null
  try {
    const response = await iamRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!response.ok) return null
    return profileSchema.parse((await response.json()).data)
  } catch {
    return null
  }
}
