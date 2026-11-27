import type { SortingState } from '@tanstack/react-table'
import type { Transaction } from '../contracts'

export function transactionSortLabel(sorting: SortingState) {
  const primarySort = sorting[0]
  return sorting.length !== 1
    ? 'custom'
    : primarySort?.id === 'created_at'
      ? primarySort.desc
        ? 'newest'
        : 'oldest'
      : primarySort?.id === 'amount'
        ? primarySort.desc
          ? 'amount_desc'
          : 'amount_asc'
        : 'custom'
}

export function transactionSorting(value: string): SortingState {
  return [
    {
      id: value.startsWith('amount') ? 'amount' : 'created_at',
      desc: value === 'newest' || value === 'amount_desc',
    },
  ]
}

// Detail navigation intentionally follows only the first sort, as before.
export function orderTransactionDetails(rows: Transaction[], sorting: SortingState) {
  const order = sorting[0]
  if (!order) return rows
  return [...rows].sort((a, b) => {
    const value = (row: Transaction) =>
      order.id === 'merchant_name'
        ? (row.merchant?.name ?? '')
        : String(row[order.id as keyof Transaction] ?? '')
    const comparison = ['amount', 'fee_amount', 'net_amount'].includes(order.id)
      ? Number(value(a)) - Number(value(b))
      : value(a).localeCompare(value(b))
    return order.desc ? -comparison : comparison
  })
}
