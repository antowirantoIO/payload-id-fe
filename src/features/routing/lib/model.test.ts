import { describe, expect, it } from 'vitest'
import { routingInputSchema } from '../schemas/contracts'
import {
  deleteRouting,
  isRoutingEligible,
  makeRoutingFixtures,
  restoreRouting,
  saveRouting,
  updateRoutingStatus,
} from './model'

describe('routing local actions', () => {
  it('keeps fixture pairs unique and rejects duplicate create', () => {
    const rows = makeRoutingFixtures()
    expect(
      new Set(
        rows.map((row) => [row.provider_code, row.channel_code, row.merchant_scope].join(':')),
      ).size,
    ).toBe(rows.length)
    expect(() => saveRouting(rows, rows[0])).toThrow('duplicate')
  })
  it('validates decimal limits and positive expiry without floating point rounding', () => {
    const row = makeRoutingFixtures()[1]
    expect(
      routingInputSchema.safeParse({
        ...row,
        min_amount: '9007199254740993.01',
        max_amount: '9007199254740993.00',
      }).success,
    ).toBe(false)
    expect(
      routingInputSchema.safeParse({
        ...row,
        min_amount: '1',
        max_amount: '2',
        default_expiry_minutes: '0',
      }).success,
    ).toBe(false)
    expect(
      isRoutingEligible(
        { ...row, status: 'ACTIVE', min_amount: '9007199254740993.01' },
        '9007199254740993.00',
      ),
    ).toBe(false)
  })
  it('updates only selected rule and archives/restores the same identity', () => {
    const rows = makeRoutingFixtures()
    const changed = updateRoutingStatus(rows, rows[1].id, 'INACTIVE')
    expect(changed[1].status).toBe('INACTIVE')
    expect(changed[0]).toBe(rows[0])
    const remaining = deleteRouting(rows, rows[0].id)
    expect(remaining).toHaveLength(rows.length - 1)
    expect(restoreRouting(remaining, rows[0])[0].id).toBe(rows[0].id)
    expect(restoreRouting(rows, rows[0])).toBe(rows)
  })
})
