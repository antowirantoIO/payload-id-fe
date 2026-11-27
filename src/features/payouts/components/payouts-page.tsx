'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { Copy, Download, RefreshCw } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { DataTableSidePanel } from '@/components/shared/data-table/data-table-side-panel'
import type { FilterGroup } from '@/components/shared/data-table/filters'
import { SaveViewDialog } from '@/components/shared/data-table/save-view-dialog'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceSavedViews } from '@/components/shared/data-table/workspace-saved-views'
import { RecordSection } from '@/components/shared/record-section'
import { SemanticStatus, type StatusTone } from '@/components/shared/semantic-status'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { type WorkspaceProfile, workspaceFor } from '@/lib/auth/workspace'
import { downloadFile } from '@/lib/download'
import type { Payout, PayoutAction, PayoutFilters } from '../contracts'
import {
  payoutDefaultDensity,
  payoutDefaultPinning,
  payoutDefaultSorting,
  payoutDefaultVisibility,
  payoutEmptyFilter,
  payoutTabStatuses,
  payoutTabs,
  usePayoutSavedViews,
} from '../hooks/use-payout-saved-views'
import { exportPayoutsCsv } from '../lib/export'
import { filterPayouts, loadMockPayouts } from '../lib/mock'
import {
  applyPayoutAction,
  canTakeAction,
  comparePayoutDecimals,
  maskAccountNumber,
  type PayoutAccess,
} from '../lib/model'

const statusTone: Record<string, StatusTone> = {
  SUCCESS: 'success',
  SETTLED: 'success',
  FAILED: 'danger',
  PENDING_APPROVAL: 'warning',
  PENDING: 'warning',
  PROCESSING: 'info',
  CREATED: 'neutral',
}

export function PayoutsPage({ profile }: { profile: WorkspaceProfile }) {
  const t = useTranslations('payouts')
  const locale = useLocale()
  const router = useRouter()
  const [rows, setRows] = useState<Payout[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<(typeof payoutTabs)[number]>('all')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterGroup>(payoutEmptyFilter)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>(payoutDefaultSorting)
  const [visibility, setVisibility] = useState<VisibilityState>(payoutDefaultVisibility)
  const [pinning, setPinning] = useState(payoutDefaultPinning)
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>(payoutDefaultDensity)
  const access: PayoutAccess = useMemo(() => {
    const workspace = workspaceFor(profile)
    return {
      canApprove: profile.permissions.includes('payout.approve'),
      canUpdate: profile.permissions.includes('payout.update'),
      canRetry:
        profile.permissions.includes('payout.update') &&
        workspace === 'platform' &&
        profile.roles.some((role) => role.code === 'SUPER_ADMIN'),
      canCreate: profile.permissions.includes('payout.create') && Boolean(profile.merchant_id),
      scope: profile.merchant_id
        ? { merchantId: profile.merchant_id }
        : workspace === 'platform'
          ? {}
          : { tenantId: profile.tenant_id },
    }
  }, [profile])
  const query = useQuery({
    queryKey: ['payout-transactions', profile.id],
    queryFn: ({ signal }) => loadMockPayouts(signal),
    staleTime: Infinity,
    retry: false,
  })
  const filters: PayoutFilters = useMemo(() => ({ search }), [search])
  const visible = useMemo(() => {
    const filtered = filterPayouts(rows, filters, access.scope).filter(
      (row) => !payoutTabStatuses[tab].length || payoutTabStatuses[tab].includes(row.status),
    )
    const sort = sorting[0]
    if (!sort) return filtered
    return [...filtered].sort((left, right) => {
      const a = sort.id === 'amount' ? left.amount : String(left[sort.id as keyof Payout] ?? '')
      const b = sort.id === 'amount' ? right.amount : String(right[sort.id as keyof Payout] ?? '')
      const result =
        sort.id === 'amount'
          ? comparePayoutDecimals(String(a), String(b))
          : String(a).localeCompare(String(b), undefined, { numeric: true })
      return sort.desc ? -result : result
    })
  }, [access.scope, filters, rows, sorting, tab])
  const viewState = useMemo(
    () => ({ search, filter, sorting, visibility, pinning, density, tab }),
    [search, filter, sorting, visibility, pinning, density, tab],
  )
  const saved = usePayoutSavedViews(viewState)
  const fields = [
    {
      id: 'status',
      label: t('status'),
      type: 'enum' as const,
      options: Object.keys(statusTone).map((value) => ({ value, label: t(value) })),
    },
    {
      id: 'environment',
      label: t('environment'),
      type: 'enum' as const,
      options: ['SANDBOX', 'LIVE'].map((value) => ({ value, label: t(value) })),
    },
    { id: 'amount', label: t('amount'), type: 'number' as const },
    { id: 'created_at', label: t('created'), type: 'date' as const, includeTime: true },
    { id: 'platform_reference_id', label: t('reference'), type: 'text' as const },
    { id: 'external_id', label: t('externalId'), type: 'text' as const },
    { id: 'merchant.name', label: t('merchant'), type: 'text' as const },
    { id: 'payout_detail.destination_bank_code', label: t('bank'), type: 'text' as const },
  ]
  const columns: ColumnDef<Payout>[] = [
    {
      accessorKey: 'platform_reference_id',
      header: t('reference'),
      size: 220,
      meta: { label: t('reference') },
      cell: ({ row }) => (
        <button
          type="button"
          className="min-h-9 font-mono text-sm font-medium text-primary hover:underline"
          onClick={() => setSelectedId(row.original.id)}
        >
          {row.original.platform_reference_id}
        </button>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('created'),
      size: 200,
      meta: { label: t('created') },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
          }).format(new Date(row.original.created_at))}
        </span>
      ),
    },
    {
      accessorKey: 'merchant.name',
      header: t('merchant'),
      size: 170,
      meta: { label: t('merchant') },
      cell: ({ row }) => <span>{row.original.merchant?.name ?? t('masked')}</span>,
    },
    {
      accessorKey: 'payout_detail.destination_account_name',
      header: t('recipient'),
      size: 190,
      meta: { label: t('recipient') },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.payout_detail.destination_account_name}
        </span>
      ),
    },
    {
      accessorKey: 'payout_detail.destination_bank_name',
      header: t('bank'),
      size: 180,
      meta: { label: t('bank') },
      cell: ({ row }) => (
        <span>
          {row.original.payout_detail.destination_bank_name ??
            row.original.payout_detail.destination_bank_code ??
            t('masked')}
        </span>
      ),
    },
    {
      id: 'destination_account_number_masked',
      accessorFn: (row) => maskAccountNumber(row.payout_detail.destination_account_number),
      header: t('account'),
      size: 155,
      meta: { label: t('account') },
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {maskAccountNumber(row.original.payout_detail.destination_account_number)}
        </span>
      ),
    },
    {
      accessorKey: 'payout_detail.payout_method',
      header: t('method'),
      size: 155,
      meta: { label: t('method') },
      cell: ({ row }) => (
        <span className="text-sm">{row.original.payout_detail.payout_method}</span>
      ),
    },
    {
      accessorKey: 'payout_detail.transfer_channel',
      header: t('transferChannel'),
      size: 160,
      meta: { label: t('transferChannel') },
      cell: ({ row }) => (
        <span>{row.original.payout_detail.transfer_channel ?? t('notProvided')}</span>
      ),
    },
    {
      accessorKey: 'payout_detail.source',
      header: t('source'),
      size: 140,
      meta: { label: t('source') },
      cell: ({ row }) => <span>{row.original.payout_detail.source}</span>,
    },
    {
      accessorKey: 'status',
      header: t('status'),
      size: 165,
      meta: { label: t('status') },
      cell: ({ row }) => (
        <SemanticStatus label={t(row.original.status)} tone={statusTone[row.original.status]} />
      ),
    },
    {
      accessorKey: 'amount',
      header: t('amount'),
      size: 185,
      meta: { label: t('amount') },
      sortingFn: (a, b) => comparePayoutDecimals(a.original.amount, b.original.amount),
      cell: ({ row }) => (
        <span className="block whitespace-nowrap text-right text-sm font-medium tabular-nums">
          {new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: row.original.currency,
            maximumFractionDigits: 2,
          }).format(Number(row.original.amount))}
        </span>
      ),
    },
  ]
  if (query.data && !rows.length) setRows(query.data)
  function handleExport(exportRows: Payout[]) {
    downloadFile(exportPayoutsCsv(exportRows), 'payout-transactions.csv')
  }
  function resetFilters() {
    setSearch('')
    setFilter(payoutEmptyFilter)
    setSelection({})
    saved.setActiveViewId(null)
  }
  function selectView(view: (typeof saved.views)[number] | null) {
    if (!view) {
      resetFilters()
      setTab('all')
      setSorting(payoutDefaultSorting)
      setVisibility(payoutDefaultVisibility)
      setPinning(payoutDefaultPinning)
      setDensity(payoutDefaultDensity)
      return
    }
    setSearch(view.search)
    setFilter(structuredClone(view.filter))
    setTab(view.tab as (typeof payoutTabs)[number])
    setSorting(structuredClone(view.sorting))
    setVisibility({ ...view.visibility })
    setPinning(structuredClone(view.pinning))
    setDensity(view.density)
    setSelection({})
    saved.setActiveViewId(view.id)
  }
  const currentPayout = rows.find((payout) => payout.id === selectedId) ?? null
  function applyView(view?: (typeof saved.views)[number]) {
    if (!view) return selectView(null)
    setSearch(view.search)
    setFilter(structuredClone(view.filter))
    setTab(view.tab as (typeof payoutTabs)[number])
    setSorting(structuredClone(view.sorting))
    setVisibility({ ...view.visibility })
    setPinning(structuredClone(view.pinning))
    setDensity(view.density)
    setSelection({})
    saved.setActiveViewId(view.id)
  }
  function actionHandler(action: PayoutAction) {
    if (!currentPayout || !canTakeAction(currentPayout, action, access)) return
    const updated = applyPayoutAction(currentPayout, action, access)
    setRows((previous) => previous.map((row) => (row.id === updated.id ? updated : row)))
  }
  return (
    <div className="space-y-5">
      <WorkspaceHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button variant="outline" onClick={() => query.refetch()}>
              <RefreshCw className="size-3.5" />
              {t('refresh')}
            </Button>
            <Button variant="outline" onClick={() => handleExport(visible)}>
              <Download className="size-3.5" />
              {t('export')}
            </Button>
            {access.canCreate && (
              <Button onClick={() => router.push('/payouts/create')}>{t('create')}</Button>
            )}
          </>
        }
      />
      <TableWorkspace
        label={t('title')}
        notice={t('workspaceNotice')}
        tabs={{
          items: payoutTabs.map((value) => ({ value, label: t(value) })),
          value: tab,
          onChange: (value) => {
            setTab(value as (typeof payoutTabs)[number])
            setSelection({})
            saved.setActiveViewId(null)
          },
        }}
        loadingLabel={t('loading')}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        error={
          query.isError
            ? {
                title: t('error'),
                description: t('error'),
                preservedLabel: t('workspaceNotice'),
                retryLabel: t('retry'),
                onRetry: () => {
                  void query.refetch()
                },
              }
            : undefined
        }
        columns={columns}
        data={visible}
        getRowId={(row) => row.id}
        emptyMessage={t('empty')}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={visibility}
        onColumnVisibilityChange={setVisibility}
        columnPinning={pinning}
        onColumnPinningChange={setPinning}
        density={density}
        onDensityChange={setDensity}
        onRowClick={(row) => setSelectedId(row.original.id)}
        footerSummary={(table) =>
          t('resultRange', {
            start: visible.length
              ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
              : 0,
            end: Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              visible.length,
            ),
            total: visible.length,
          })
        }
        paginationLabel={t('pagination')}
        sortLabel={t('sort')}
        selectionLabel={t('selectedRows')}
        bulkBarVariant="soft"
        toolbar={{
          search,
          onSearch: (value) => {
            setSearch(value)
            setSelection({})
            saved.setActiveViewId(null)
          },
          filter,
          onFilter: (value) => {
            setFilter(value)
            setSelection({})
            saved.setActiveViewId(null)
          },
          sort:
            sorting.length === 1
              ? sorting[0].id === 'created_at'
                ? sorting[0].desc
                  ? 'newest'
                  : 'oldest'
                : sorting[0].desc
                  ? 'amount_desc'
                  : 'amount_asc'
              : 'custom',
          onSort: (value) =>
            setSorting(
              value === 'oldest'
                ? [{ id: 'created_at', desc: false }]
                : value === 'amount_desc'
                  ? [{ id: 'amount', desc: true }]
                  : value === 'amount_asc'
                    ? [{ id: 'amount', desc: false }]
                    : [{ id: 'created_at', desc: true }],
            ),
          savedViews: (
            <WorkspaceSavedViews
              label={t('savedViews')}
              hint={t('savedViewsHint')}
              defaultViewLabel={t('all')}
              views={saved.views}
              activeViewId={saved.activeViewId}
              onSaveNew={() => saved.setSaveOpen(true)}
              onSelect={(view) => applyView(saved.views.find((item) => item.id === view?.id))}
              onSetDefault={saved.setDefault}
              onDelete={saved.remove}
            />
          ),
          onReset: resetFilters,
          fields,
          quickFields: ['status'],
          sortOptions: [
            { value: 'newest', label: t('newest') },
            { value: 'oldest', label: t('oldest') },
            { value: 'amount_desc', label: t('amountHigh') },
            { value: 'amount_asc', label: t('amountLow') },
          ],
          searchLabel: t('search'),
          searchPlaceholder: t('searchPlaceholder'),
          multiSearchDescription: t('multiSearchDescription'),
          multiSearchPlaceholder: 'PAY-0000001\nPAYOUT-00002',
        }}
        bulkActions={[
          {
            label: t('exportSelected'),
            icon: Download,
            onSelect: (ids) => handleExport(visible.filter((row) => ids.includes(row.id))),
          },
          {
            label: t('bulkCopy'),
            icon: Copy,
            onSelect: async (ids) => {
              await navigator.clipboard.writeText(
                visible
                  .filter((row) => ids.includes(row.id))
                  .map((row) => row.platform_reference_id)
                  .join('\n'),
              )
            },
          },
        ]}
      />
      <SaveViewDialog
        open={saved.saveOpen}
        onOpenChange={saved.setSaveOpen}
        onSubmit={(input) => saved.save(input)}
      />
      {currentPayout && (
        <DataTableSidePanel
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          title={t('details')}
          description={currentPayout.platform_reference_id}
          size="xl"
          footer={
            <div className="flex flex-wrap gap-2">
              {(['approve', 'reject', 'retry', 'cancel'] as PayoutAction[])
                .filter((action) => canTakeAction(currentPayout, action, access))
                .map((action) => (
                  <Button
                    key={action}
                    variant={action === 'reject' || action === 'cancel' ? 'destructive' : 'outline'}
                    onClick={() => actionHandler(action)}
                  >
                    {t(
                      action === 'retry'
                        ? 'retryAction'
                        : action === 'cancel'
                          ? 'cancelAction'
                          : action,
                    )}
                  </Button>
                ))}
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                {t('close')}
              </Button>
            </div>
          }
        >
          <RecordSection title={t('identity')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t('reference')}</dt>
                <dd className="mt-1 font-mono text-sm">{currentPayout.platform_reference_id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('externalId')}</dt>
                <dd className="mt-1 font-mono text-sm">{currentPayout.external_id}</dd>
              </div>
            </dl>
          </RecordSection>
          <RecordSection title={t('providerDetails')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t('provider')}</dt>
                <dd className="mt-1 text-sm">{currentPayout.issuer?.name ?? t('notProvided')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('channel')}</dt>
                <dd className="mt-1 text-sm">{currentPayout.channel?.name ?? t('notProvided')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('channelCode')}</dt>
                <dd className="mt-1 font-mono text-xs">
                  {currentPayout.channel_code ?? t('notProvided')}
                </dd>
              </div>
            </dl>
          </RecordSection>
          <RecordSection title={t('recipientDetails')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t('recipient')}</dt>
                <dd className="mt-1 text-sm">
                  {currentPayout.payout_detail.destination_account_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('account')}</dt>
                <dd className="mt-1 font-mono text-sm">
                  {maskAccountNumber(currentPayout.payout_detail.destination_account_number)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('bank')}</dt>
                <dd className="mt-1 text-sm">
                  {currentPayout.payout_detail.destination_bank_name ??
                    currentPayout.payout_detail.destination_bank_code ??
                    t('masked')}
                </dd>
              </div>
            </dl>
          </RecordSection>
          <RecordSection title={t('delivery')}>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">{t('method')}</dt>
                <dd className="mt-1 text-sm">{currentPayout.payout_detail.payout_method}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('transferChannel')}</dt>
                <dd className="mt-1 text-sm">
                  {currentPayout.payout_detail.transfer_channel ?? t('notProvided')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('source')}</dt>
                <dd className="mt-1 text-sm">{currentPayout.payout_detail.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('verified')}</dt>
                <dd className="mt-1 text-sm">
                  {currentPayout.payout_detail.destination_account_verified
                    ? t('fixtureVerified')
                    : t('fixtureUnverified')}
                </dd>
              </div>
            </dl>
          </RecordSection>
          <RecordSection title={t('financial')}>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">{t('amount')}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums">
                  {currentPayout.currency} {currentPayout.amount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('fee')}</dt>
                <dd className="mt-1 text-sm tabular-nums">
                  {currentPayout.currency} {currentPayout.fee_amount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('status')}</dt>
                <dd className="mt-1">
                  <SemanticStatus
                    label={t(currentPayout.status)}
                    tone={statusTone[currentPayout.status]}
                  />
                </dd>
              </div>
            </dl>
          </RecordSection>
        </DataTableSidePanel>
      )}
    </div>
  )
}
