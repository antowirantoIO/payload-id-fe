import { queryOptions } from '@tanstack/react-query'
import { loadMockTransactions } from './mock'

export function transactionQueryOptions(revision: number) {
  return queryOptions({
    queryKey: ['mock-payment-transactions', revision],
    queryFn: ({ signal }) => loadMockTransactions(signal, false),
    retry: false,
    staleTime: Infinity,
  })
}
