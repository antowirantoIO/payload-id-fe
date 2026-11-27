'use client'

import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Download, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { DataTableSidePanel } from '@/components/shared/data-table/data-table-side-panel'
import type { FilterGroup } from '@/components/shared/data-table/filters'
import { EMPTY_FILTER } from '@/components/shared/data-table/filters'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { TableWorkspace } from '@/components/shared/data-table/table-workspace'
import { WorkspaceViewControl } from '@/components/shared/data-table/workspace-view-control'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { downloadFile } from '@/lib/download'
import { useProviderLocal } from '../hooks/use-provider-local'

import { exportProviders } from '../lib/export'
import { filterProviders, type Provider } from '../lib/model'
import { buildProviderColumns } from './provider-columns'
import { ProviderDetail } from './provider-detail'
import { ProviderForm } from './provider-form'

type Action = 'delete' | 'restore' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'test'
export function ProvidersPage({ permissions }: { permissions: string[] }) {
  const t = useTranslations('providers')
  const local = useProviderLocal(permissions)
  const canCreate = permissions.includes('issuer.create')
  const canUpdate = permissions.includes('issuer.update')
  const canDelete = permissions.includes('issuer.delete')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [filter, setFilter] = useState<FilterGroup>(EMPTY_FILTER)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated_at', desc: true }])
  const [density, setDensity] = useState<'normal' | 'compact' | 'comfortable'>('normal')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<Provider | 'new' | null>(null)
  const [action, setAction] = useState<Action | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [testing, setTesting] = useState(false)
  const [credentialName, setCredentialName] = useState('')
  const selected = local.rows.find((row) => row.id === selectedId)
  const visible = useMemo(
    () =>
      applyTableFilter(
        filterProviders(
          local.rows.filter((row) => (tab === 'archived' ? !!row.deleted_at : !row.deleted_at)),
          search,
          tab === 'all' || tab === 'archived' ? undefined : tab,
        ),
        filter,
      ),
    [local.rows, tab, search, filter],
  )
  const columns = useMemo(() => buildProviderColumns(t, (row) => setSelectedId(row.id)), [t])
  function requestAction(value: Action) {
    setAction(value)
    setError('')
  }
  function reset() {
    setSearch('')
    setFilter(EMPTY_FILTER)
    setSelection({})
  }
  async function confirm() {
    if (!selected || !action || testing) return
    const current = local.rows.find((row) => row.id === selected.id)
    if (!current) return
    if (action === 'delete' && canDelete) {
      local.remove(current.id)
      setNotice('archivedNotice')
      setSelectedId(null)
    } else if (action === 'restore' && canUpdate) {
      local.restore(current.id)
      setNotice('restoredNotice')
    } else if (action === 'test' && canUpdate && !current.deleted_at) {
      setTesting(true)
      await new Promise((resolve) => setTimeout(resolve, 180))
      local.test(current.id)
      setTesting(false)
      setNotice('localChecked')
    } else if (
      ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(action) &&
      canUpdate &&
      !current.deleted_at
    ) {
      local.changeStatus(current.id, action as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')
      setNotice('statusUpdated')
    } else return
    setAction(null)
    setSelection({})
  }
  const actionLabel =
    action === 'delete'
      ? t('archive')
      : action === 'restore'
        ? t('restore')
        : action === 'test'
          ? t('testConnection')
          : action === 'ACTIVE'
            ? t('active')
            : action === 'MAINTENANCE'
              ? t('maintenance')
              : t('inactive')
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
              onClick={() => downloadFile(exportProviders(visible), 'providers.csv')}
            >
              <Download className="size-3.5" />
              {t('export')}
            </Button>
            {canCreate && (
              <Button
                onClick={() => {
                  setError('')
                  setEditor('new')
                }}
              >
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
          items: ['all', 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'archived'].map((value) => ({
            value,
            label: t(
              value === 'ACTIVE'
                ? 'active'
                : value === 'INACTIVE'
                  ? 'inactive'
                  : value === 'MAINTENANCE'
                    ? 'maintenance'
                    : value,
            ),
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
        sorting={sorting}
        onSortingChange={setSorting}
        density={density}
        onDensityChange={setDensity}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        onRowClick={(row) => setSelectedId(row.original.id)}
        emptyMessage={t('noProviders')}
        paginationLabel={t('pagination')}
        bulkActions={[
          {
            label: t('export'),
            icon: Download,
            onSelect: (ids) =>
              downloadFile(
                exportProviders(visible.filter((row) => ids.includes(row.id))),
                'providers.csv',
              ),
          },
        ]}
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
              options: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].map((value) => ({
                value,
                label: t(
                  value === 'ACTIVE' ? 'active' : value === 'INACTIVE' ? 'inactive' : 'maintenance',
                ),
              })),
            },
            {
              id: 'health_status',
              label: t('health'),
              type: 'enum',
              options: ['HEALTHY', 'DEGRADED', 'DOWN', 'UNTESTED'].map((value) => ({
                value,
                label: value,
              })),
            },
          ],
          quickFields: ['status', 'health_status'],
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
          onReset: reset,
        }}
      />
      {selected && (
        <DataTableSidePanel
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          title={selected.name}
          description={t('details')}
          size="xl"
          footer={
            <div className="flex flex-wrap gap-2">
              {!selected.deleted_at && canUpdate && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError('')
                      setEditor(selected)
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button variant="outline" onClick={() => requestAction('test')}>
                    {t('testConnection')}
                  </Button>
                  {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const)
                    .filter((status) => status !== selected.status)
                    .map((status) => (
                      <Button key={status} variant="outline" onClick={() => requestAction(status)}>
                        {t(
                          status === 'ACTIVE'
                            ? 'active'
                            : status === 'INACTIVE'
                              ? 'inactive'
                              : 'maintenance',
                        )}
                      </Button>
                    ))}
                </>
              )}
              {!selected.deleted_at && canDelete && (
                <Button variant="destructive" onClick={() => requestAction('delete')}>
                  {t('archive')}
                </Button>
              )}
              {selected.deleted_at && canUpdate && (
                <Button variant="outline" onClick={() => requestAction('restore')}>
                  {t('restore')}
                </Button>
              )}
            </div>
          }
        >
          <ProviderDetail
            provider={selected}
            canViewCredentials={permissions.includes('issuer_credential.view')}
          />
          {!selected.deleted_at && permissions.includes('issuer_credential.create') && (
            <form
              className="grid gap-3 px-6 py-5"
              onSubmit={(event) => {
                event.preventDefault()
                if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(credentialName)) return
                local.credential(selected.id, credentialName, false)
                setCredentialName('')
                setNotice('credentialUpdated')
              }}
            >
              <Label htmlFor="provider-credential-name">{t('credentialKey')}</Label>
              <Input
                id="provider-credential-name"
                required
                pattern="[a-zA-Z][a-zA-Z0-9_]{0,63}"
                value={credentialName}
                onChange={(event) => setCredentialName(event.target.value)}
              />
              <Button type="submit" variant="outline">
                {t('addCredential')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('credentialSafe')}</p>
            </form>
          )}
          {!selected.deleted_at &&
            permissions.includes('issuer_credential.view') &&
            permissions.includes('issuer_credential.delete') && (
              <div className="flex flex-wrap gap-2 px-6 pb-6">
                {selected.credential_keys.map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      local.credential(selected.id, key, true)
                      setNotice('credentialUpdated')
                    }}
                  >
                    {t('removeCredential', { key })}
                  </Button>
                ))}
              </div>
            )}
        </DataTableSidePanel>
      )}
      {editor && (
        <DataTableSidePanel
          open
          onOpenChange={(open) => {
            if (!open) setEditor(null)
          }}
          title={t(editor === 'new' ? 'add' : 'edit')}
        >
          <ProviderForm
            key={editor === 'new' ? 'new' : editor.id}
            initial={editor === 'new' ? undefined : editor}
            errorText={error ? t(error) : undefined}
            onClose={() => setEditor(null)}
            onSave={(value) => {
              if (!(editor === 'new' ? canCreate : canUpdate)) return
              const result = local.save(value, editor === 'new' ? undefined : editor.id)
              const message = Object.values(result.errors)[0]
              if (message) {
                setError(message)
                return
              }
              setNotice(editor === 'new' ? 'created' : 'updated')
              setEditor(null)
            }}
          />
        </DataTableSidePanel>
      )}
      {action && selected && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !testing) setAction(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirmAction', { action: actionLabel })}</DialogTitle>
              <DialogDescription>
                {t(action === 'test' ? 'localCheckDescription' : 'confirmDescription')}
              </DialogDescription>
            </DialogHeader>
            <p className="font-mono text-sm">{selected.code}</p>
            <DialogFooter>
              <Button disabled={testing} variant="outline" onClick={() => setAction(null)}>
                {t('cancel')}
              </Button>
              <Button
                disabled={testing}
                variant={action === 'delete' ? 'destructive' : 'default'}
                onClick={() => {
                  void confirm()
                }}
              >
                {t(testing ? 'testing' : 'confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
