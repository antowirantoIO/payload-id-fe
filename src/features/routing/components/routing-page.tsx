'use client'

import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { DataTableSidePanel } from '@/components/shared/data-table/data-table-side-panel'
import { EMPTY_FILTER, type FilterGroup } from '@/components/shared/data-table/filters'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceViewControl } from '@/components/shared/data-table/workspace-view-control'
import { RecordSection } from '@/components/shared/record-section'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { downloadFile } from '@/lib/download'
import { RoutingDemoProvider, useRoutingDemo } from '../hooks/use-routing-demo'
import { filterRouting } from '../lib/model'
import type { RoutingRecord } from '../schemas/contracts'
import { buildRoutingColumns } from './routing-columns'
import { RoutingEditorDialog } from './routing-editor-dialog'

export function RoutingPage({ permissions }: { permissions: string[] }) {
  return (
    <RoutingDemoProvider>
      <RoutingWorkspace permissions={permissions} />
    </RoutingDemoProvider>
  )
}
function RoutingWorkspace({ permissions }: { permissions: string[] }) {
  const t = useTranslations('routing')
  const local = useRoutingDemo()
  const canCreate = permissions.includes('merchant_issuer_channel.create')
  const canUpdate = permissions.includes('merchant_issuer_channel.update')
  const canDelete = permissions.includes('merchant_issuer_channel.delete')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [filter, setFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated', desc: true }])
  const [density, setDensity] = useState<'normal' | 'compact' | 'comfortable'>('normal')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<RoutingRecord | 'new' | null>(null)
  const [action, setAction] = useState<'enable' | 'disable' | 'archive' | 'restore' | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const source = tab === 'archived' ? local.deleted : local.rows
  const visible = useMemo(
    () =>
      applyTableFilter(
        filterRouting(source, search, tab === 'ACTIVE' || tab === 'INACTIVE' ? tab : ''),
        filter,
      ),
    [source, search, tab, filter],
  )
  const selected = [...local.rows, ...local.deleted].find((row) => row.id === selectedId)
  const columns = useMemo(() => buildRoutingColumns(t, (row) => setSelectedId(row.id)), [t])
  function reset() {
    setSearch('')
    setFilter(EMPTY_FILTER)
    setSelection({})
  }
  function csv(rows: RoutingRecord[]) {
    const fields = [
      'id',
      'provider_code',
      'provider_name',
      'channel_code',
      'channel_name',
      'merchant_scope',
      'issuer_channel_code',
      'status',
      'min_amount',
      'max_amount',
      'default_expiry_minutes',
    ] as const
    const quote = (value: unknown) => {
      const text = String(value ?? '')
      return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`
    }
    downloadFile(
      '﻿' +
        [
          fields.join(','),
          ...rows.map((row) => fields.map((key) => quote(row[key])).join(',')),
        ].join('\r\n'),
      'routing-rules.csv',
    )
  }
  function confirm() {
    if (!selected || !action) return
    const current = (action === 'restore' ? local.deleted : local.rows).find(
      (row) => row.id === selected.id,
    )
    if (!current) {
      setAction(null)
      return
    }
    try {
      if (action === 'archive' && canDelete) {
        local.remove(current.id)
        setNotice('removed')
      } else if (action === 'restore' && canCreate) {
        local.restore(current.id)
        setNotice('restored')
      } else if ((action === 'enable' || action === 'disable') && canUpdate) {
        local.changeStatus(current.id, action === 'enable' ? 'ACTIVE' : 'INACTIVE')
        setNotice('changed')
      } else return
      setAction(null)
      setSelectedId(null)
      setSelection({})
    } catch {
      setError('duplicate')
    }
  }
  return (
    <div className="space-y-5">
      <WorkspaceHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                reset()
                setNotice('')
              }}
            >
              <RefreshCw className="size-3.5" />
              {t('refresh')}
            </Button>
            <Button variant="outline" disabled={!visible.length} onClick={() => csv(visible)}>
              <Download className="size-3.5" />
              {t('export')}
            </Button>
            {canCreate && (
              <Button onClick={() => setEditing('new')}>
                <Plus className="size-3.5" />
                {t('add')}
              </Button>
            )}
          </>
        }
      />
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {t(notice)}
        </p>
      )}
      <TableWorkspace
        label={t('title')}
        tabs={{
          items: ['all', 'ACTIVE', 'INACTIVE', 'archived'].map((value) => ({
            value,
            label: t(value === 'ACTIVE' ? 'active' : value === 'INACTIVE' ? 'inactive' : value),
          })),
          value: tab,
          onChange: (value) => {
            setTab(value)
            setSelection({})
            setSelectedId(null)
          },
        }}
        columns={columns}
        data={visible}
        getRowId={(row) => row.id}
        density={density}
        onDensityChange={setDensity}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        onRowClick={(row) => setSelectedId(row.original.id)}
        emptyMessage={t('empty')}
        paginationLabel={t('pagination')}
        bulkActions={[
          {
            label: t('exportSelected'),
            icon: Download,
            onSelect: (ids) => csv(visible.filter((row) => ids.includes(row.id))),
          },
        ]}
        footerSummary={(table) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return t('resultRange', {
            start: visible.length ? pageIndex * pageSize + 1 : 0,
            end: Math.min((pageIndex + 1) * pageSize, visible.length),
            total: visible.length,
          })
        }}
        toolbar={{
          search,
          onSearch: (value) => {
            setSearch(value)
            setSelection({})
          },
          searchLabel: t('search'),
          searchPlaceholder: t('searchPlaceholder'),
          multiSearchApplyLabel: t('search'),
          multiSearchDescription: t('searchPlaceholder'),
          filter,
          onFilter: (value) => {
            setFilter(value)
            setSelection({})
          },
          fields: [
            {
              id: 'status',
              label: t('status'),
              type: 'enum',
              options: ['ACTIVE', 'INACTIVE'].map((value) => ({
                value,
                label: t(value === 'ACTIVE' ? 'active' : 'inactive'),
              })),
            },
            {
              id: 'provider_code',
              label: t('provider'),
              type: 'enum',
              options: [...new Set(source.map((row) => row.provider_code))].map((value) => ({
                value,
                label: value,
              })),
            },
            {
              id: 'channel_code',
              label: t('channel'),
              type: 'enum',
              options: [...new Set(source.map((row) => row.channel_code))].map((value) => ({
                value,
                label: value,
              })),
            },
          ],
          quickFields: ['provider_code', 'channel_code'],
          sort:
            sorting.length === 1 && sorting[0].id === 'updated'
              ? sorting[0].desc
                ? 'newest'
                : 'oldest'
              : 'custom',
          onSort: (value) => setSorting([{ id: 'updated', desc: value !== 'oldest' }]),
          sortOptions: [
            { value: 'newest', label: t('newest') },
            { value: 'oldest', label: t('oldest') },
          ],
          sortLabel: t('sort'),
          savedViews: (
            <WorkspaceViewControl
              label={t('savedViews')}
              state={{ search, filter, tab, sorting, density }}
              defaultState={{
                search: '',
                filter: EMPTY_FILTER,
                tab: 'all',
                sorting: [{ id: 'updated', desc: true }],
                density: 'normal' as const,
              }}
              onApply={(view) => {
                setSearch(view.search)
                setFilter(view.filter)
                setTab(view.tab)
                setSorting(view.sorting)
                setDensity(view.density)
                setSelection({})
              }}
            />
          ),
          onReset: reset,
        }}
      />
      {selected && (
        <DataTableSidePanel
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          title={t('details')}
          description={selected.issuer_channel_code}
          footer={
            <div className="flex flex-wrap gap-2">
              {tab !== 'archived' && canUpdate && (
                <>
                  <Button variant="outline" onClick={() => setEditing(selected)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError('')
                      setAction(selected.status === 'ACTIVE' ? 'disable' : 'enable')
                    }}
                  >
                    {t(selected.status === 'ACTIVE' ? 'disable' : 'enable')}
                  </Button>
                </>
              )}
              {tab !== 'archived' && canDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setError('')
                    setAction('archive')
                  }}
                >
                  {t('archive')}
                </Button>
              )}
              {tab === 'archived' && canCreate && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setError('')
                    setAction('restore')
                  }}
                >
                  {t('restore')}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                {t('close')}
              </Button>
            </div>
          }
        >
          <RecordSection title={t('identity')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  'provider_name',
                  'provider_code',
                  'channel_name',
                  'channel_code',
                  'issuer_channel_code',
                  'status',
                ] as const
              ).map((key) => (
                <div key={key}>
                  <dt className="text-xs text-muted-foreground">{t(key)}</dt>
                  <dd className="mt-1 wrap-anywhere text-sm">{selected[key]}</dd>
                </div>
              ))}
            </dl>
          </RecordSection>
          <RecordSection title={t('limits')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                ['merchant_scope', 'min_amount', 'max_amount', 'default_expiry_minutes'] as const
              ).map((key) => (
                <div key={key}>
                  <dt className="text-xs text-muted-foreground">{t(key)}</dt>
                  <dd className="mt-1 wrap-anywhere text-sm tabular-nums">
                    {selected[key] ?? t('notProvided')}
                  </dd>
                </div>
              ))}
            </dl>
          </RecordSection>
          <RecordSection title={t('record')}>
            <dl className="grid gap-4">
              {(['id', 'created', 'updated'] as const).map((key) => (
                <div key={key}>
                  <dt className="text-xs text-muted-foreground">{t(key)}</dt>
                  <dd className="mt-1 wrap-anywhere font-mono text-xs">{selected[key]}</dd>
                </div>
              ))}
            </dl>
          </RecordSection>
        </DataTableSidePanel>
      )}
      {editing && (
        <RoutingEditorDialog
          key={editing === 'new' ? 'new' : editing.id}
          row={editing === 'new' ? undefined : editing}
          canSave={editing === 'new' ? canCreate : canUpdate}
          onClose={() => setEditing(null)}
          onSaved={() => setNotice('saved')}
        />
      )}
      {action && selected && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setAction(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirmTitle', { action: t(action) })}</DialogTitle>
              <DialogDescription>{t('confirmDescription')}</DialogDescription>
            </DialogHeader>
            <p className="font-mono text-sm">{selected.issuer_channel_code}</p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {t(error)}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAction(null)}>
                {t('cancel')}
              </Button>
              <Button variant={action === 'archive' ? 'destructive' : 'default'} onClick={confirm}>
                {t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
