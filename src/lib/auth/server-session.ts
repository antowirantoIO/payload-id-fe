import 'server-only'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { cache } from 'react'
import { auth } from '@/auth'
import { hasValidBackendSession } from './backend-session'

export const getServerSession = cache(auth)

/** Shared by BFF handlers; returning null leaves HTTP error policy to the caller. */
export async function getBackendSession(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: new URL(process.env.AUTH_URL ?? request.url).protocol === 'https:',
  })
  return hasValidBackendSession(token) ? token : null
}

export const getRequestBackendSession = cache(async () => {
  const request = new NextRequest(process.env.AUTH_URL ?? 'http://localhost:3000', {
    headers: await headers(),
  })
  return getBackendSession(request)
})
