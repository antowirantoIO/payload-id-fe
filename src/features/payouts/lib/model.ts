import type { Payout, PayoutAction, PayoutScope } from '../contracts'

export type PayoutAccess = {
  canApprove: boolean
  canUpdate: boolean
  canRetry: boolean
  canCreate: boolean
  scope?: PayoutScope
}

export const canApprove = (payout: Payout) => payout.status === 'PENDING_APPROVAL'
export const canReject = canApprove
export const canRetry = (payout: Payout) =>
  payout.status === 'FAILED' &&
  payout.failure_code !== 'APPROVAL_REJECTED' &&
  payout.failure_code !== 'CANCELLED'
export const canCancel = (payout: Payout) =>
  ['CREATED', 'PENDING', 'PENDING_APPROVAL'].includes(payout.status)

export function canTakeAction(payout: Payout, action: PayoutAction, access?: PayoutAccess) {
  const allowed =
    action === 'approve'
      ? canApprove(payout)
      : action === 'reject'
        ? canReject(payout)
        : action === 'retry'
          ? canRetry(payout)
          : canCancel(payout)
  if (!allowed || !access) return allowed
  if (action === 'approve' || action === 'reject') return access.canApprove
  if (action === 'retry') return access.canRetry
  return access.canUpdate
}

export function comparePayoutDecimals(left: string, right: string) {
  const [leftInteger, leftFraction = ''] = left.split('.')
  const [rightInteger, rightFraction = ''] = right.split('.')
  const integerOrder = leftInteger
    .padStart(Math.max(leftInteger.length, rightInteger.length), '0')
    .localeCompare(rightInteger.padStart(Math.max(leftInteger.length, rightInteger.length), '0'))
  return integerOrder || leftFraction
    .padEnd(Math.max(leftFraction.length, rightFraction.length), '0')
    .localeCompare(rightFraction.padEnd(Math.max(leftFraction.length, rightFraction.length), '0'))
}

export function maskAccountNumber(value: string) {
  if (value.length <= 4) return value
  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
}

export function applyPayoutAction(
  payout: Payout,
  action: PayoutAction,
  access?: PayoutAccess,
): Payout {
  if (!canTakeAction(payout, action, access)) return payout
  const now = new Date().toISOString()
  if (action === 'approve') return { ...payout, status: 'PENDING', updated_at: now }
  if (action === 'retry')
    return {
      ...payout,
      status: 'CREATED',
      failure_code: undefined,
      failure_message: undefined,
      failed_at: undefined,
      updated_at: now,
    }
  const failureCode = action === 'reject' ? 'APPROVAL_REJECTED' : 'CANCELLED'
  return {
    ...payout,
    status: 'FAILED',
    failure_code: failureCode,
    failure_message: action === 'reject' ? 'Payout rejected during approval.' : 'Payout cancelled.',
    failed_at: now,
    updated_at: now,
  }
}

export function applyPayoutActionToRows(rows: Payout[], id: string, action: PayoutAction) {
  return rows.map((payout) => (payout.id === id ? applyPayoutAction(payout, action) : payout))
}
