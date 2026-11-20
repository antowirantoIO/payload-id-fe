import { expect, it } from 'vitest'
import { transactionSchema } from '../contracts'
import { emptyFilters, filterTransactions, loadMockTransactions, mockTransactions } from './mock'

it('validates every fixture against the backend DTO and preserves decimal strings', () => {
  for (const transaction of mockTransactions) {
    expect(transactionSchema.safeParse(transaction).success).toBe(true)
    expect(typeof transaction.amount).toBe('string')
    expect(transaction.platform_reference_id).toMatch(/^DEMO-/)
  }
  expect(new Set(mockTransactions.map((row) => row.id)).size).toBe(mockTransactions.length)
})
it('combines search, status, dates, environment and amount bounds', () => {
  const sample = mockTransactions[0]
  expect(
    filterTransactions(mockTransactions, { ...emptyFilters, search: sample.external_id }),
  ).toEqual([sample])
  expect(
    filterTransactions(mockTransactions, { ...emptyFilters, status: 'FAILED' }).every(
      (row) => row.status === 'FAILED',
    ),
  ).toBe(true)
  expect(
    filterTransactions(mockTransactions, {
      ...emptyFilters,
      environment: 'LIVE',
      minimum: '150000',
      maximum: '500000',
      start: '2026-11-13',
      end: '2026-11-14',
    }).every(
      (row) =>
        row.environment === 'LIVE' &&
        Number(row.amount) >= 150000 &&
        Number(row.amount) <= 500000 &&
        row.created_at.slice(0, 10) >= '2026-11-13',
    ),
  ).toBe(true)
  expect(
    filterTransactions(mockTransactions, { ...emptyFilters, search: 'no-such-transaction' }),
  ).toEqual([])
})
it('supports aborting a mock request', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(loadMockTransactions(controller.signal, false)).rejects.toMatchObject({
    name: 'AbortError',
  })
})

it('searches several references with OR semantics and combines with filters', () => {
  const result = filterTransactions(mockTransactions, {
    ...emptyFilters,
    search: 'DEMO-ORDER-00001; DEMO-ORDER-00002\nDEMO-ORDER-00003',
  })
  expect(result).toHaveLength(3)
  expect(filterTransactions(result, { ...emptyFilters, status: 'FAILED' })).toHaveLength(1)
})
