import { describe, expect, it } from 'vitest'
import { mockPayouts } from './mock'
import { applyPayoutAction, canCancel, canRetry, maskAccountNumber } from './model'

describe('payout model', () => {
  it('enforces backend action transitions', () => {
    const approval = mockPayouts.find((row) => row.status === 'PENDING_APPROVAL')!
    expect(applyPayoutAction(approval, 'approve').status).toBe('PENDING')
    expect(applyPayoutAction(approval, 'reject').failure_code).toBe('APPROVAL_REJECTED')
    expect(canCancel(approval)).toBe(true)
    const failed = mockPayouts.find((row) => row.status === 'FAILED')!
    expect(canRetry(failed)).toBe(true)
    expect(applyPayoutAction(failed, 'retry').status).toBe('CREATED')
  })

  it('masks account numbers while preserving the final four digits', () => {
    expect(maskAccountNumber('123456789')).toBe('*****6789')
    expect(maskAccountNumber('1234')).toBe('1234')
  })
})
