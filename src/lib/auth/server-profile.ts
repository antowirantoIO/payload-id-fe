import 'server-only'
import { cache } from 'react'
import { profileSchema } from '@/lib/api/contracts'
import { iamRequest } from '@/lib/api/server'
import { getRequestBackendSession } from './server-session'

/** Request-scoped deduplication only: never cache profiles across users or requests. */
export const getServerProfile = cache(async () => {
  const token = await getRequestBackendSession()
  if (!token) return null
  try {
    const response = await iamRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token.backendToken}` },
    })
    if (!response.ok) return null
    return profileSchema.parse((await response.json()).data)
  } catch {
    return null
  }
})
