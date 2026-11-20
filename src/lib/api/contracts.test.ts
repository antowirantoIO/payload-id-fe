import { describe, expect, it } from 'vitest'
import { loginResultSchema, loginSchema } from './contracts'

describe('IAM contracts', () => {
  it('rejects empty passwords and invalid email', () => {
    expect(loginSchema.safeParse({ email: 'invalid', password: '' }).success).toBe(false)
  })
  it('accepts the IAM two-factor challenge without pretending it is a token', () => {
    const result = loginResultSchema.parse({
      user: { id: '1', name: 'User', email: 'user@example.com', tenant_id: '1' },
      requires_two_factor: true,
    })
    expect(result.access_token).toBeUndefined()
  })
})
