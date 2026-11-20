import { create } from 'zustand'
import { emptyFilters, type TransactionFilters } from '../lib/mock'

export const useTransactionUI = create<{
  filters: TransactionFilters
  setFilter: (key: keyof TransactionFilters, value: string) => void
  reset: () => void
}>((set) => ({
  filters: { ...emptyFilters },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  reset: () => set({ filters: { ...emptyFilters } }),
}))
