'use client'

import type { ComponentProps, ReactNode } from 'react'
import { DataTable } from './index'
import { WorkspaceError } from './workspace-error'
import { WorkspaceFrame } from './workspace-frame'
import { WorkspaceTabs } from './workspace-tabs'
import { WorkspaceToolbar } from './workspace-toolbar'

export type TableWorkspaceProps<TData, TValue = unknown> = Omit<
  ComponentProps<typeof DataTable<TData, TValue>>,
  'toolbar' | 'errorContent' | 'stickyHeader' | 'enableColumnPinning' | 'enableColumnResize'
> & {
  label: string
  tabs?: Omit<ComponentProps<typeof WorkspaceTabs>, 'label'>
  toolbar: Omit<
    ComponentProps<typeof WorkspaceToolbar<TData>>,
    'table' | 'density' | 'onDensityChange'
  >
  onDensityChange: ComponentProps<typeof WorkspaceToolbar<TData>>['onDensityChange']
  error?: Omit<ComponentProps<typeof WorkspaceError>, 'pending'>
  loadingLabel?: string
  notice?: ReactNode
}

/** Controlled composition: domain pages retain data fetching, authorization and mutation rules. */
export function TableWorkspace<TData, TValue = unknown>({
  label,
  tabs,
  toolbar,
  error,
  loadingLabel,
  notice,
  onDensityChange,
  density = 'normal',
  ...tableProps
}: TableWorkspaceProps<TData, TValue>) {
  return (
    <>
      {tabs && <WorkspaceTabs label={label} {...tabs} />}
      {notice && (
        <div role="status" aria-live="polite" className="mb-4 text-sm text-muted-foreground">
          {notice}
        </div>
      )}
      <WorkspaceFrame label={label}>
        {tableProps.isLoading && loadingLabel && (
          <p role="status" className="px-2 py-3 text-sm text-muted-foreground">
            {loadingLabel}
          </p>
        )}
        <DataTable
          {...tableProps}
          density={density}
          stickyHeader
          enableColumnPinning
          enableColumnResize
          errorContent={
            error ? <WorkspaceError {...error} pending={tableProps.isFetching} /> : undefined
          }
          toolbar={(table) => (
            <WorkspaceToolbar
              {...toolbar}
              table={table}
              density={density}
              onDensityChange={onDensityChange}
            />
          )}
        />
      </WorkspaceFrame>
    </>
  )
}
