import { expect, it } from 'vitest'
import { applyTransactionFilter } from './filter'
import { mockTransactions } from './mock'

it('keeps quick filters conjunctive with advanced OR conditions', () => {
  const result = applyTransactionFilter(mockTransactions, {
    combinator: 'or',
    conditions: [
      { id: 'quick-status', field: 'status', operator: 'in', value: ['FAILED'] },
      { id: 'amount', field: 'amount', operator: 'gte', value: 0 },
      { id: 'status', field: 'status', operator: 'in', value: ['PAID'] },
    ],
  })
  expect(result.length).toBeGreaterThan(0)
  expect(result.every((row) => row.status === 'FAILED')).toBe(true)
})

it('evaluates reference filter builder AND/OR conditions against mock DTOs', () => {
  const conditions = [
    { id: '1', field: 'status', operator: 'in' as const, value: ['FAILED'] },
    { id: '2', field: 'amount', operator: 'gte' as const, value: 500000 },
  ]
  const and = applyTransactionFilter(mockTransactions, { combinator: 'and', conditions })
  expect(and.length).toBeGreaterThan(0)
  expect(and.every((row) => row.status === 'FAILED' && Number(row.amount) >= 500000)).toBe(true)
  const or = applyTransactionFilter(mockTransactions, { combinator: 'or', conditions })
  expect(or.length).toBeGreaterThan(and.length)
})
it('supports ranges, missing values and case-insensitive text matching', () => {
  expect(
    applyTransactionFilter(mockTransactions, {
      combinator: 'and',
      conditions: [
        { id: '1', field: 'external_id', operator: 'contains', value: 'demo-order-00001' },
      ],
    }),
  ).toHaveLength(1)
  expect(
    applyTransactionFilter(mockTransactions, {
      combinator: 'and',
      conditions: [{ id: '1', field: 'amount', operator: 'between', value: [125000, 125000] }],
    }),
  ).toHaveLength(1)
  const missing = applyTransactionFilter(mockTransactions, {
    combinator: 'and',
    conditions: [{ id: '1', field: 'failed_at', operator: 'is_unknown', value: null }],
  })
  expect(missing.every((row) => row.failed_at == null)).toBe(true)
})

it('compares full UTC timestamps, not just calendar dates', () => {
  const sample = mockTransactions[0]
  const result = applyTransactionFilter(mockTransactions, {
    combinator: 'and',
    conditions: [
      {
        id: 'date',
        field: 'created_at',
        operator: 'between',
        value: ['2026-11-14T10:44', '2026-11-14T10:46'],
      },
    ],
  })
  expect(result).toContainEqual(sample)
  expect(result.every((row) => Date.parse(row.created_at) >= Date.parse('2026-11-14T10:44Z'))).toBe(
    true,
  )
  expect(
    applyTransactionFilter([sample], {
      combinator: 'and',
      conditions: [
        { id: 'date', field: 'created_at', operator: 'after', value: '2026-11-14T10:46' },
      ],
    }),
  ).toHaveLength(0)
})
