import { expect, it } from 'vitest'
import { EMPTY_FILTER } from '@/components/shared/data-table/filters'
import { serializeTransactionsCSV } from './csv'
import { mockTransactions } from './mock'
import { transactionQueryOptions } from './query-options'
import { orderTransactionDetails, transactionSorting, transactionSortLabel } from './sorting'
import { snapshotTransactionView, type TransactionViewState } from './views'

it('exports BOM, fixed field order, CRLF, quoted values and unchanged decimal strings', () => {
  const row = {
    ...mockTransactions[0],
    external_id: 'comma,"quote"\nnewline',
    amount: '000123.4500',
    net_amount: null,
  }
  const csv = serializeTransactionsCSV([row])
  expect(
    csv.startsWith(
      '﻿id,external_id,platform_reference_id,transaction_type,status,amount,currency,fee_amount,net_amount,channel_code,settlement_status,environment,created_at\r\n',
    ),
  ).toBe(true)
  expect(csv).toContain('"comma,""quote""\nnewline"')
  expect(csv).toContain('"000123.4500"')
  expect(csv).toContain(`"${row.fee_amount}","",`)
  expect(row.amount).toBe('000123.4500')
})

it('maps preset sorting and retains custom multi-sort labels', () => {
  for (const value of ['newest', 'oldest', 'amount_desc', 'amount_asc']) {
    expect(transactionSortLabel(transactionSorting(value))).toBe(value)
  }
  expect(transactionSortLabel([])).toBe('custom')
  expect(
    transactionSortLabel([
      { id: 'amount', desc: true },
      { id: 'created_at', desc: false },
    ]),
  ).toBe('custom')
})

it('keeps detail navigation numeric, stable and limited to the first sort', () => {
  const rows = [
    { ...mockTransactions[0], id: 'a', amount: '10.00', created_at: '2026-01-01' },
    { ...mockTransactions[0], id: 'b', amount: '2.00', created_at: '2026-01-02' },
    { ...mockTransactions[0], id: 'c', amount: '2.00', created_at: '2026-01-03' },
  ]
  expect(
    orderTransactionDetails(rows, [
      { id: 'amount', desc: false },
      { id: 'created_at', desc: true },
    ]).map((row) => row.id),
  ).toEqual(['b', 'c', 'a'])
  expect(rows.map((row) => row.id)).toEqual(['a', 'b', 'c'])
  expect(orderTransactionDetails(rows, [])).toBe(rows)
})

it('snapshots saved views without aliasing mutable table and advanced filter state', () => {
  const state: TransactionViewState = {
    filter: structuredClone(EMPTY_FILTER),
    search: 'DEMO',
    sort: 'newest',
    sorting: [{ id: 'created_at', desc: true }],
    visibility: { external_id: false },
    pinning: { left: ['select'], right: [] },
    density: 'normal',
    tab: 'needsReview',
  }
  const saved = snapshotTransactionView(state)
  state.sorting[0].desc = false
  state.pinning.left?.push('amount')
  state.visibility.external_id = true
  expect(saved.sorting[0].desc).toBe(true)
  expect(saved.pinning.left).toEqual(['select'])
  expect(saved.visibility.external_id).toBe(false)
  expect(saved.filter).toEqual(state.filter)
  expect(saved.filter).not.toBe(state.filter)
  expect(saved.search).toBe('DEMO')
  expect(saved.tab).toBe('needsReview')
})

it('keeps reload revision in the query key and disables mock retries and staleness', () => {
  expect(transactionQueryOptions(0).queryKey).toEqual(['mock-payment-transactions', 0])
  expect(transactionQueryOptions(1).queryKey).toEqual(['mock-payment-transactions', 1])
  expect(transactionQueryOptions(0).retry).toBe(false)
  expect(transactionQueryOptions(0).staleTime).toBe(Infinity)
})
