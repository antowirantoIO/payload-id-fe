import type { ColumnPinningState, SortingState, VisibilityState } from '@tanstack/react-table'
import type { FilterGroup } from '@/components/shared/data-table/filters'

export const defaultVisibility: VisibilityState = {
  external_id: false,
  customer_email: false,
  paid_at: false,
  expired_at: false,
}
export const workspaceTabs = [
  'allTransactions',
  'needsReview',
  'awaitingPayment',
  'successful',
] as const
export type WorkspaceTab = (typeof workspaceTabs)[number]
export const tabStatuses: Record<WorkspaceTab, string[]> = {
  allTransactions: [],
  needsReview: ['FAILED', 'REFUND_FAILED', 'PENDING_APPROVAL'],
  awaitingPayment: ['PENDING', 'PROCESSING'],
  successful: ['PAID', 'SUCCESS'],
}

export interface TransactionViewState {
  filter: FilterGroup
  search: string
  sort: string
  sorting: SortingState
  visibility: VisibilityState
  pinning: ColumnPinningState
  density: 'compact' | 'normal' | 'comfortable'
  tab: WorkspaceTab
}
export interface TransactionSavedView extends TransactionViewState {
  id: string
  name: string
  is_default: boolean
}

export function snapshotTransactionView(state: TransactionViewState): TransactionViewState {
  return {
    ...state,
    filter: structuredClone(state.filter),
    sorting: structuredClone(state.sorting),
    visibility: { ...state.visibility },
    pinning: structuredClone(state.pinning),
  }
}
