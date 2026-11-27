import { describe, expect, it } from 'vitest'
import { workspacePageTitle } from './page-title'

describe('workspace page titles', () => {
  it('resolves dashboard, capability, and feature titles', () => {
    expect(workspacePageTitle('/dashboard')).toBe('dashboard')
    expect(workspacePageTitle('/payments/transactions')).toBe('transactions')
    expect(workspacePageTitle('/merchants/demo-merchant-1/edit')).toBe('featureMerchants')
    expect(workspacePageTitle('/balances/ledger')).toBe('ledger')
  })
  it('matches path segments rather than arbitrary prefixes', () => {
    expect(workspacePageTitle('/payments-other')).toBeUndefined()
    expect(workspacePageTitle('/buyer/orders')).toBeUndefined()
  })
})
