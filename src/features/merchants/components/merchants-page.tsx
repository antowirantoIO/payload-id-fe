'use client'

import { DownloadIcon, PlusIcon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { SaveViewDialog } from '@/components/shared/data-table'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceSavedViews } from '@/components/shared/data-table/workspace-saved-views'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { downloadFile } from '@/lib/download'
import { useMerchantWorkspace } from '../hooks/use-merchant-workspace'
import { useMerchants } from '../hooks/use-merchants'
import {
  canTransition,
  exportMerchants,
  filterMerchants,
  type Merchant,
  type MerchantStatus,
} from '../lib/model'
import { buildMerchantFields, buildMerchantSortOptions } from '../lib/table-config'
import { buildMerchantColumns } from './merchant-columns'
import { MerchantStatusDialog } from './merchant-status-dialog'

function download(rows: Merchant[]) {
  downloadFile(exportMerchants(rows), 'merchants.csv', 'text/csv;charset=utf-8;')
}

export function MerchantsPage() {
  const t = useTranslations('merchants')
  const tabs = ['all', 'onboarding', 'active', 'suspended'].map((value) => ({
    value,
    label: t(`tabs.${value}`),
  }))
  const columns = useMemo(() => buildMerchantColumns(t), [t])
  const fields = useMemo(() => buildMerchantFields(t), [t])
  const sortOptions = useMemo(() => buildMerchantSortOptions(t), [t])
  const query = useMerchants()
  const rows = query.data ?? []
  const router = useRouter()
  const {
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
  } = useMerchantWorkspace()
  const filtered = useMemo(
    () =>
      applyTableFilter(
        filterMerchants(rows, search, '', '', '', '').map((row) => ({
          ...row,
          environment: row.is_sandbox ? 'sandbox' : 'production',
        })),
        filter,
      ).filter(
        (row) =>
          tab === 'all' ||
          (tab === 'onboarding'
            ? ['DRAFT', 'PENDING_KYC', 'PENDING_APPROVAL', 'APPROVED'].includes(row.status)
            : row.status === tab.toUpperCase()),
      ),
    [rows, search, filter, tab],
  )
  const savedViews = (
    <WorkspaceSavedViews
      label={t('savedViews')}
      hint={t('savedViewsHint')}
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
      setNotice(t('unavailable'))
      return
    }
    setChange({ ids, status })
  }
  return (
    <div>
      <WorkspaceHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RefreshCwIcon className="size-3.5" />
              {t('refresh')}
            </Button>
            <Button
              variant="outline"
              className="h-9"
              disabled={!filtered.length || query.isError || query.isPending}
              onClick={() => download(filtered)}
            >
              <DownloadIcon className="size-3.5" />
              {t('exportResults')}
            </Button>
            <Button className="h-9" onClick={() => router.push('/merchants/create')}>
              <PlusIcon className="size-3.5" />
              {t('addMerchant')}
            </Button>
          </>
        }
      />
      <TableWorkspace
        label={t('title')}
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
        columns={columns}
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
        emptyMessage={t('empty')}
        error={
          query.isError
            ? {
                title: t('loadErrorTitle'),
                description: t('loadErrorDescription'),
                retryLabel: t('retry'),
                preservedLabel: t('preserved'),
                onRetry: () => void query.refetch(),
              }
            : undefined
        }
        footerSummary={(table) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return query.isPending
            ? t('loading')
            : t('resultRange', {
                start: filtered.length ? pageIndex * pageSize + 1 : 0,
                end: Math.min((pageIndex + 1) * pageSize, filtered.length),
                total: filtered.length,
              })
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
          fields,
          quickFields: ['status', 'tier'],
          sortOptions,
          searchLabel: t('search'),
          searchPlaceholder: t('searchPlaceholder'),
          multiSearchPlaceholder: 'MRC001\nMRC002',
          multiSearchApplyLabel: t('search'),
          multiSearchDescription: t('multiSearchDescription'),
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
            label: t('exportSelected'),
            icon: DownloadIcon,
            onSelect: (ids) => download(filtered.filter((row) => ids.includes(row.id))),
          },
          ...(['ACTIVE', 'SUSPENDED', 'TERMINATED'] as const).map((status) => ({
            label:
              status === 'ACTIVE'
                ? t('activate')
                : status === 'SUSPENDED'
                  ? t('suspend')
                  : t('terminate'),
            icon: RefreshCwIcon,
            onSelect: (ids: string[]) => bulkChange(ids, status),
          })),
        ]}
      />
      <SaveViewDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        isPending={false}
        onSubmit={saveView}
      />
      {change && (
        <MerchantStatusDialog
          ids={change.ids}
          status={change.status}
          onClose={() => setChange(null)}
          onComplete={(message) => {
            setNotice(message ?? t('updated'))
            setChange(null)
            setSelection({})
          }}
        />
      )}
    </div>
  )
}
