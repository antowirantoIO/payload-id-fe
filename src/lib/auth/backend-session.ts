import type { JWT } from 'next-auth/jwt'

/** Missing expiry is never treated as an unlimited backend session. */
export function hasValidBackendSession(
  token: JWT | null,
  now = Date.now(),
): token is JWT & { backendToken: string; backendExpires: number } {
  return Boolean(token?.backendToken && token.backendExpires && token.backendExpires > now)
}
