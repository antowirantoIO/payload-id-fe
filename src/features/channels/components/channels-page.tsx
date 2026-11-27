'use client'

import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Download, Plus } from 'lucide-react'
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
import { useChannelWorkspace } from '../hooks/use-channel-workspace'
import {
  type Channel,
  channelCategories,
  channelDirections,
  channelStatuses,
  emptyChannel,
  exportChannels,
  filterChannels,
} from '../lib/model'
import { buildChannelColumns } from './channel-columns'
import { ChannelFormDialog } from './channel-form-dialog'

export function ChannelsPage({ permissions }: { permissions: string[] }) {
  const t = useTranslations('channels')
  const local = useChannelWorkspace(permissions)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [filter, setFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Channel | 'new' | null>(null)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated_at', desc: true }])
  const [density, setDensity] = useState<'normal' | 'compact' | 'comfortable'>('normal')
  const [action, setAction] = useState<'archive' | 'restore' | Channel['status'] | null>(null)
  const selected = local.rows.find((row) => row.id === selectedId)
  const visible = useMemo(
    () =>
      applyTableFilter(
        filterChannels(local.rows, search, tab === 'archived').filter((row) =>
          tab === 'archived'
            ? !!row.deleted_at
            : !row.deleted_at && (tab === 'all' || row.status === tab),
        ),
        filter,
      ),
    [local.rows, search, tab, filter],
  )
  const columns = useMemo(() => buildChannelColumns(t, (row) => setSelectedId(row.id)), [t])
  const actionLabel =
    action === 'archive'
      ? t('archive')
      : action === 'restore'
        ? t('restore')
        : action
          ? t(`statuses.${action}`)
          : ''
  function confirm() {
    if (!selected || !action || !local.can(action === 'archive' ? 'delete' : 'update')) return
    local.act(selected.id, action)
    setAction(null)
    setSelectedId(null)
    setSelection({})
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
              disabled={!visible.length}
              onClick={() => downloadFile(exportChannels(visible), 'channels.csv')}
            >
              <Download className="size-3.5" />
              {t('export')}
            </Button>
            {local.can('create') && (
              <Button onClick={() => setEditing('new')}>
                <Plus className="size-3.5" />
                {t('add')}
              </Button>
            )}
          </>
        }
      />
      {local.notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {t(local.notice)}
        </p>
      )}
      <TableWorkspace
        label={t('title')}
        tabs={{
          items: ['all', ...channelStatuses, 'archived'].map((value) => ({
            value,
            label: channelStatuses.some((status) => status === value)
              ? t(`statuses.${value}`)
              : t(value),
          })),
          value: tab,
          onChange: (value) => {
            setTab(value)
            setSelectedId(null)
            setSelection({})
          },
        }}
        columns={columns}
        data={visible}
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        density={density}
        onDensityChange={setDensity}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        onRowClick={(row) => setSelectedId(row.original.id)}
        emptyMessage={t('empty')}
        paginationLabel={t('pagination')}
        bulkActions={[
          {
            label: t('export'),
            icon: Download,
            onSelect: (ids) =>
              downloadFile(
                exportChannels(visible.filter((row) => ids.includes(row.id))),
                'channels.csv',
              ),
          },
        ]}
        toolbar={{
          search,
          onSearch: (value) => {
            setSearch(value)
            setSelection({})
          },
          filter,
          onFilter: (value) => {
            setFilter(value)
            setSelection({})
          },
          searchLabel: t('search'),
          searchPlaceholder: t('searchPlaceholder'),
          multiSearchApplyLabel: t('search'),
          multiSearchDescription: t('searchPlaceholder'),
          fields: [
            {
              id: 'status',
              label: t('status'),
              type: 'enum',
              options: channelStatuses.map((value) => ({ value, label: t(`statuses.${value}`) })),
            },
            {
              id: 'category',
              label: t('category'),
              type: 'enum',
              options: channelCategories.map((value) => ({
                value,
                label: t(`categories.${value}`),
              })),
            },
            {
              id: 'direction',
              label: t('direction'),
              type: 'enum',
              options: channelDirections.map((value) => ({
                value,
                label: t(`directions.${value}`),
              })),
            },
          ],
          quickFields: ['category', 'direction'],
          sort:
            sorting.length === 1 && sorting[0].id === 'updated_at'
              ? sorting[0].desc
                ? 'newest'
                : 'oldest'
              : 'custom',
          onSort: (value) => setSorting([{ id: 'updated_at', desc: value !== 'oldest' }]),
          sortLabel: t('sort'),
          sortOptions: [
            { value: 'newest', label: t('newest') },
            { value: 'oldest', label: t('oldest') },
          ],
          savedViews: (
            <WorkspaceViewControl
              label={t('savedViews')}
              state={{ search, filter, tab, sorting, density }}
              defaultState={{
                search: '',
                filter: EMPTY_FILTER,
                tab: 'all',
                sorting: [{ id: 'updated_at', desc: true }],
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
          onReset: () => {
            setSearch('')
            setFilter(EMPTY_FILTER)
            setSelection({})
            local.setNotice('')
          },
        }}
      />
      {selected && (
        <DataTableSidePanel
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          title={t('details')}
          description={selected.code}
          footer={
            <div className="flex flex-wrap gap-2">
              {!selected.deleted_at && local.can('update') && (
                <>
                  <Button variant="outline" onClick={() => setEditing(selected)}>
                    {t('edit')}
                  </Button>
                  {channelStatuses
                    .filter((status) => status !== selected.status)
                    .map((status) => (
                      <Button key={status} variant="outline" onClick={() => setAction(status)}>
                        {t(`statuses.${status}`)}
                      </Button>
                    ))}
                </>
              )}
              {!selected.deleted_at && local.can('delete') && (
                <Button variant="destructive" onClick={() => setAction('archive')}>
                  {t('archive')}
                </Button>
              )}
              {selected.deleted_at && local.can('update') && (
                <Button variant="outline" onClick={() => setAction('restore')}>
                  {t('restore')}
                </Button>
              )}
            </div>
          }
        >
          <RecordSection title={t('details')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(['code', 'name', 'currency'] as const).map((key) => (
                <div key={key}>
                  <dt className="text-xs text-muted-foreground">{t(key)}</dt>
                  <dd className="mt-1 wrap-anywhere text-sm">{selected[key]}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-muted-foreground">{t('provider')}</dt>
                <dd className="mt-1 text-sm">{selected.provider_name ?? t('noProvider')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('category')}</dt>
                <dd className="mt-1 text-sm">{t(`categories.${selected.category}`)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('direction')}</dt>
                <dd className="mt-1 text-sm">{t(`directions.${selected.direction}`)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('status')}</dt>
                <dd className="mt-1 text-sm">{t(`statuses.${selected.status}`)}</dd>
              </div>
            </dl>
          </RecordSection>
          <RecordSection title={t('record')}>
            <dl className="grid gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">{t('created')}</dt>
                <dd className="mt-1 text-sm">{selected.created_at}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('updated')}</dt>
                <dd className="mt-1 text-sm">{selected.updated_at}</dd>
              </div>
            </dl>
          </RecordSection>
        </DataTableSidePanel>
      )}
      {editing && (
        <ChannelFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? emptyChannel() : editing}
          onClose={() => setEditing(null)}
          onSubmit={(draft) => local.save(draft, editing === 'new' ? undefined : editing.id)}
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
              <DialogTitle>{t('confirmAction', { action: actionLabel })}</DialogTitle>
              <DialogDescription>{t('deleteDescription')}</DialogDescription>
            </DialogHeader>
            <p className="font-mono text-sm">{selected.code}</p>
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
