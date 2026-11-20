'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  ColumnPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { DownloadIcon, PlusIcon, RefreshCwIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { SaveViewDialog } from '@/components/shared/data-table'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceSavedViews } from '@/components/shared/data-table/workspace-saved-views'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { useMerchantDemo } from '../hooks/use-merchant-demo'
import {
  canTransition,
  exportMerchants,
  filterMerchants,
  type Merchant,
  type MerchantStatus,
} from '../lib/model'
import { merchantFields, merchantSortOptions } from '../lib/table-config'
import { merchantColumns } from './merchant-columns'
import { MerchantStatusDialog } from './merchant-status-dialog'

type Density = 'normal' | 'compact' | 'comfortable'
type View = {
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
const tabs = ['All merchants', 'Onboarding', 'Active', 'Suspended'].map((value) => ({
  value,
  label: value,
}))
const defaultVisibility = { legal_name: false, updated_at: false }
const defaultPinning = { left: ['select', 'code'], right: [] }

function download(rows: Merchant[]) {
  const url = URL.createObjectURL(
    new Blob([exportMerchants(rows)], { type: 'text/csv;charset=utf-8;' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'merchants.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function MerchantsPage() {
  const { rows } = useMerchantDemo()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [tab, setTab] = useState('All merchants')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [visibility, setVisibility] = useState<VisibilityState>(defaultVisibility)
  const [pinning, setPinning] = useState<ColumnPinningState>(defaultPinning)
  const [density, setDensity] = useState<Density>('normal')
  const [notice, setNotice] = useState('')
  const [change, setChange] = useState<{ ids: string[]; status: MerchantStatus } | null>(null)
  const [views, setViews] = useState<View[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const query = useQuery({
    queryKey: ['merchant-ui-demo'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return true
    },
    retry: false,
  })
  const filtered = useMemo(
    () =>
      applyTableFilter(
        filterMerchants(rows, search, '', '', '', '').map((row) => ({
          ...row,
          environment: row.is_sandbox ? 'Sandbox' : 'Production',
        })),
        filter,
      ).filter(
        (row) =>
          tab === 'All merchants' ||
          (tab === 'Onboarding'
            ? ['DRAFT', 'PENDING_KYC', 'PENDING_APPROVAL', 'APPROVED'].includes(row.status)
            : row.status === tab.toUpperCase()),
      ),
    [rows, search, filter, tab],
  )
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
  function applyView(view: View | null) {
    if (!view) {
      resetFilters()
      setSorting([{ id: 'created_at', desc: true }])
      setVisibility(defaultVisibility)
      setPinning(defaultPinning)
      setDensity('normal')
      setTab('All merchants')
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
  const savedViews = (
    <WorkspaceSavedViews
      label="Saved views"
      hint="Views are stored in this workspace only, not on the server."
      views={views}
      activeViewId={activeViewId}
      onSelect={(view) => applyView(views.find((item) => item.id === view?.id) ?? null)}
      onSaveNew={() => setSaveOpen(true)}
      onSetDefault={(view) =>
        setViews((previous) =>
          previous.map((item) => ({ ...item, is_default: item.id === view.id })),
        )
      }
      onDelete={(view) => {
        setViews((previous) => previous.filter((item) => item.id !== view.id))
        if (activeViewId === view.id) setActiveViewId(null)
      }}
    />
  )
  const bulkChange = (ids: string[], status: MerchantStatus) => {
    const targets = filtered.filter((row) => ids.includes(row.id))
    if (!canTransition(targets, status)) {
      setNotice(
        'Status change unavailable: every selected merchant must be eligible. Review the selected statuses.',
      )
      return
    }
    setChange({ ids, status })
  }
  return (
    <div>
      <WorkspaceHeader
        title="Merchants"
        description="Manage business profiles, onboarding and merchant lifecycle."
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RefreshCwIcon className="size-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-9"
              disabled={!filtered.length || query.isError || query.isPending}
              onClick={() => download(filtered)}
            >
              <DownloadIcon className="size-3.5" />
              Export results
            </Button>
            <Button className="h-9" onClick={() => router.push('/merchants/create')}>
              <PlusIcon className="size-3.5" />
              Add merchant
            </Button>
          </>
        }
      />
      <TableWorkspace
        label="Merchants"
        tabs={{
          items: tabs,
          value: tab,
          onChange: (value) => {
            setTab(value)
            setSelection({})
            setActiveViewId(null)
          },
        }}
        notice={notice}
        columns={merchantColumns}
        data={filtered}
        getRowId={(row) => row.id}
        density={density}
        onDensityChange={setDensity}
        columnPinning={pinning}
        onColumnPinningChange={setPinning}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        sorting={sorting}
        onSortingChange={(value) => {
          setSorting(value)
          setActiveViewId(null)
        }}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        columnVisibility={visibility}
        onColumnVisibilityChange={setVisibility}
        onRowClick={(row) => router.push(`/merchants/${row.original.id}`)}
        emptyMessage="No merchants found. Adjust your filters or add a merchant."
        error={
          query.isError
            ? {
                title: 'Unable to load merchants',
                description: 'Merchant data could not be retrieved. Please try again.',
                retryLabel: 'Retry',
                preservedLabel: 'Your filters and local edits have been preserved.',
                onRetry: () => void query.refetch(),
              }
            : undefined
        }
        footerSummary={(table) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return query.isPending
            ? 'Loading merchants…'
            : `Showing ${filtered.length ? pageIndex * pageSize + 1 : 0}–${Math.min((pageIndex + 1) * pageSize, filtered.length)} of ${filtered.length} merchants`
        }}
        toolbar={{
          search,
          onSearch: (value) => {
            setSearch(value)
            setSelection({})
            setActiveViewId(null)
          },
          filter,
          onFilter: (value) => {
            setFilter(value)
            setSelection({})
            setActiveViewId(null)
          },
          fields: merchantFields,
          quickFields: ['status', 'tier'],
          sortOptions: merchantSortOptions,
          searchLabel: 'Search merchants',
          searchPlaceholder: 'Search merchant name, code, city or ID',
          multiSearchPlaceholder: 'MERCHANT-0001\nMERCHANT-0002',
          multiSearchApplyLabel: 'Search merchants',
          multiSearchDescription:
            'Search merchant names, codes, cities or IDs. Enter one value per line, or separate values with commas or semicolons. Matches any unique value.',
          sort,
          onSort: (value) => {
            if (value === 'custom') return
            setSorting([
              {
                id: value.startsWith('name') ? 'name' : 'created_at',
                desc: value === 'newest' || value === 'name_desc',
              },
            ])
            setActiveViewId(null)
          },
          savedViews,
          onReset: resetFilters,
        }}
        bulkActions={[
          {
            label: 'Export selected',
            icon: DownloadIcon,
            onSelect: (ids) => download(filtered.filter((row) => ids.includes(row.id))),
          },
          ...(['ACTIVE', 'SUSPENDED', 'TERMINATED'] as const).map((status) => ({
            label:
              status === 'ACTIVE' ? 'Activate' : status === 'SUSPENDED' ? 'Suspend' : 'Terminate',
            icon: RefreshCwIcon,
            onSelect: (ids: string[]) => bulkChange(ids, status),
          })),
        ]}
      />
      <SaveViewDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        isPending={false}
        onSubmit={({ name, isDefault }) => {
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
        }}
      />
      {change && (
        <MerchantStatusDialog
          ids={change.ids}
          status={change.status}
          onClose={() => setChange(null)}
          onComplete={() => {
            setNotice('Merchant status updated.')
            setChange(null)
            setSelection({})
          }}
        />
      )}
    </div>
  )
}
