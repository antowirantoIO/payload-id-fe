import { expect, it } from 'vitest'
import { canViewModule, type WorkspaceProfile, workspaceFor } from './workspace'

function profile(overrides: Partial<WorkspaceProfile> = {}): WorkspaceProfile {
  return {
    id: '1',
    email: 'a@example.com',
    name: 'A',
    tenant_id: '1',
    tenant_type: 'PLATFORM',
    merchant_id: undefined,
    roles: [],
    permissions: ['transaction.read', 'issuer.view', 'tenant.view'],
    ...overrides,
  }
}
it('separates merchant and reseller from platform even with broad permissions', () => {
  const merchant = profile({ merchant_id: 'm' })
  expect(workspaceFor(merchant)).toBe('merchant')
  expect(canViewModule(merchant, 'payment', 'transactions')).toBe(true)
  expect(canViewModule(merchant, 'issuer', 'issuers')).toBe(false)
  expect(canViewModule(profile({ tenant_type: 'RESELLER' }), 'issuer', 'issuers')).toBe(false)
})
it('fails closed for missing permissions and unknown tenant types', () => {
  expect(canViewModule(profile({ permissions: [] }), 'payment', 'transactions')).toBe(false)
  expect(workspaceFor(profile({ tenant_type: 'UNKNOWN' }))).toBeUndefined()
  expect(canViewModule(profile({ tenant_type: 'UNKNOWN' }), 'iam', 'tenants')).toBe(false)
})
it('reserves internal Vault references for platform super admin', () => {
  expect(canViewModule(profile(), 'vault', 'keys')).toBe(false)
  expect(canViewModule(profile({ roles: [{ code: 'SUPER_ADMIN' }] }), 'vault', 'keys')).toBe(true)
})
