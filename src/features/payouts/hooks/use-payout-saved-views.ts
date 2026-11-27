import type { ColumnPinningState, SortingState, VisibilityState } from '@tanstack/react-table'
import { useState } from 'react'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'

export const payoutDefaultVisibility: VisibilityState = {
  'payout_detail.payout_method': false,
  settlement_status: false,
  failure_code: false,
  environment: false,
}
export const payoutDefaultPinning: ColumnPinningState = {
  left: ['select', 'platform_reference_id'],
  right: [],
}
export const payoutDefaultSorting: SortingState = [{ id: 'created_at', desc: true }]
export const payoutDefaultDensity = 'normal' as const
export const payoutEmptyFilter: FilterGroup = EMPTY_FILTER
export const payoutTabs = [
  'all',
  'awaitingApproval',
  'processing',
  'completed',
  'needsAttention',
] as const
export type PayoutTab = (typeof payoutTabs)[number]
export const payoutTabStatuses: Record<PayoutTab, string[]> = {
  all: [],
  awaitingApproval: ['PENDING_APPROVAL'],
  processing: ['CREATED', 'PENDING', 'PROCESSING'],
  completed: ['SUCCESS', 'SETTLED'],
  needsAttention: ['FAILED'],
}

export type PayoutViewState = {
  search: string
  filter: FilterGroup
  sorting: SortingState
  visibility: VisibilityState
  pinning: ColumnPinningState
  density: 'compact' | 'normal' | 'comfortable'
  tab: string
}
export type PayoutSavedView = PayoutViewState & { id: string; name: string; is_default: boolean }

function snapshot(state: PayoutViewState): PayoutViewState {
  return {
    ...state,
    filter: structuredClone(state.filter),
    sorting: structuredClone(state.sorting),
    visibility: { ...state.visibility },
    pinning: structuredClone(state.pinning),
  }
}

export function usePayoutSavedViews(state: PayoutViewState) {
  const [views, setViews] = useState<PayoutSavedView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  function save({ name, isDefault }: { name: string; isDefault: boolean }) {
    const id = crypto.randomUUID()
    setViews((current) => [
      ...current.map((view) => (isDefault ? { ...view, is_default: false } : view)),
      { id, name, is_default: isDefault, ...snapshot(state) },
    ])
    setActiveViewId(id)
    setSaveOpen(false)
  }

  function setDefault(view: { id: string }) {
    setViews((current) => current.map((item) => ({ ...item, is_default: item.id === view.id })))
  }

  function remove(view: { id: string }) {
    setViews((current) => current.filter((item) => item.id !== view.id))
    if (activeViewId === view.id) setActiveViewId(null)
  }

  return { views, activeViewId, setActiveViewId, saveOpen, setSaveOpen, save, setDefault, remove }
}
