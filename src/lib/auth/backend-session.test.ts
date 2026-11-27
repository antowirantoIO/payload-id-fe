import { describe, expect, it } from 'vitest'
import { hasValidBackendSession } from './backend-session'

describe('backend session validity', () => {
  it('rejects absent tokens, missing fields, and expired sessions including exact expiry', () => {
    for (const token of [
      null,
      {},
      { backendToken: 'test' },
      { backendExpires: 200 },
      { backendToken: 'test', backendExpires: 100 },
    ]) {
      expect(hasValidBackendSession(token, 100)).toBe(false)
    }
  })
  it('accepts only a token with a future expiry', () => {
    expect(hasValidBackendSession({ backendToken: 'test', backendExpires: 101 }, 100)).toBe(true)
  })
})
