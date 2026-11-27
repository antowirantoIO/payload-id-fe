'use client'

import type {
  ColumnPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'
import type { MerchantStatus } from '../lib/model'

type Density = 'normal' | 'compact' | 'comfortable'
export type MerchantView = {
  id: string
  name: string
  is_default: boolean
  search: string
  filter: FilterGroup
  sorting: SortingState
  visibility: VisibilityState
  pinning: ColumnPinningState
  density: Density
  tab: string
}
const defaultVisibility = { legal_name: false, updated_at: false }
const defaultPinning = { left: ['select', 'code'], right: [] }

// Intentionally page-local: records alone belong to MerchantDemoProvider.
export function useMerchantWorkspace() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [tab, setTab] = useState('all')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [visibility, setVisibility] = useState<VisibilityState>(defaultVisibility)
  const [pinning, setPinning] = useState<ColumnPinningState>(defaultPinning)
  const [density, setDensity] = useState<Density>('normal')
  const [notice, setNotice] = useState('')
  const [change, setChange] = useState<{ ids: string[]; status: MerchantStatus } | null>(null)
  const [views, setViews] = useState<MerchantView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const sort =
    sorting.length !== 1
      ? 'custom'
      : sorting[0]?.id === 'created_at'
        ? sorting[0].desc
          ? 'newest'
          : 'oldest'
        : sorting[0]?.id === 'name'
          ? sorting[0].desc
            ? 'name_desc'
            : 'name_asc'
          : 'custom'
  function resetFilters() {
    setSearch('')
    setFilter(EMPTY_FILTER)
    setSelection({})
    setActiveViewId(null)
  }
  function applyView(view: MerchantView | null) {
    if (!view) {
      resetFilters()
      setSorting([{ id: 'created_at', desc: true }])
      setVisibility(defaultVisibility)
      setPinning(defaultPinning)
      setDensity('normal')
      setTab('all')
      return
    }
    setSearch(view.search)
    setFilter(structuredClone(view.filter))
    setSorting(structuredClone(view.sorting))
    setVisibility({ ...view.visibility })
    setPinning(structuredClone(view.pinning))
    setDensity(view.density)
    setTab(view.tab)
    setSelection({})
    setActiveViewId(view.id)
  }
  function saveView({ name, isDefault }: { name: string; isDefault: boolean }) {
    const id = crypto.randomUUID()
    setViews((previous) => [
      ...previous.map((view) => (isDefault ? { ...view, is_default: false } : view)),
      {
        id,
        name,
        is_default: isDefault,
        search,
        filter: structuredClone(filter),
        sorting: structuredClone(sorting),
        visibility: { ...visibility },
        pinning: structuredClone(pinning),
        density,
        tab,
      },
    ])
    setActiveViewId(id)
    setSaveOpen(false)
  }
  return {
    search,
    setSearch,
    filter,
    setFilter,
    tab,
    setTab,
    selection,
    setSelection,
    sorting,
    setSorting,
    visibility,
    setVisibility,
    pinning,
    setPinning,
    density,
    setDensity,
    notice,
    setNotice,
    change,
    setChange,
    views,
    setViews,
    activeViewId,
    setActiveViewId,
    saveOpen,
    setSaveOpen,
    sort,
    resetFilters,
    applyView,
    saveView,
  }
}
