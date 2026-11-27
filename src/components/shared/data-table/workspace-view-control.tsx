'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { SaveViewDialog } from './save-view-dialog'
import { WorkspaceSavedViews } from './workspace-saved-views'

type SavedWorkspaceView<T> = { id: string; name: string; is_default: boolean; state: T }

/** In-memory snapshots only; callers retain ownership of all domain/table state. */
export function WorkspaceViewControl<T>({
  state,
  defaultState,
  onApply,
  label,
}: {
  state: T
  defaultState: T
  onApply: (state: T) => void
  label: string
}) {
  const t = useTranslations('table')
  const [views, setViews] = useState<SavedWorkspaceView<T>[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const active = views.find((view) => view.id === activeId)
  const matches = active && JSON.stringify(active.state) === JSON.stringify(state)
  return (
    <>
      <WorkspaceSavedViews
        label={label}
        hint={t('saveViewDescription')}
        views={views}
        activeViewId={matches ? activeId : null}
        onSaveNew={() => setOpen(true)}
        onSelect={(view) => {
          const saved = views.find((item) => item.id === view?.id)
          setActiveId(saved?.id ?? null)
          onApply(structuredClone(saved?.state ?? defaultState))
        }}
        onSetDefault={(view) =>
          setViews((current) =>
            current.map((item) => ({ ...item, is_default: item.id === view.id })),
          )
        }
        onDelete={(view) => {
          setViews((current) => current.filter((item) => item.id !== view.id))
          if (activeId === view.id) setActiveId(null)
        }}
      />
      {open && (
        <SaveViewDialog
          open
          onOpenChange={setOpen}
          onSubmit={({ name, isDefault }) => {
            const id = crypto.randomUUID()
            setViews((current) => [
              ...current.map((view) => (isDefault ? { ...view, is_default: false } : view)),
              { id, name, is_default: isDefault, state: structuredClone(state) },
            ])
            setActiveId(id)
            setOpen(false)
          }}
        />
      )}
    </>
  )
}
