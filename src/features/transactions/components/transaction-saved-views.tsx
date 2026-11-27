import { SaveViewDialog } from '@/components/shared/data-table'
import { WorkspaceSavedViews } from '@/components/shared/data-table/workspace-saved-views'
import type { useTransactionSavedViews } from '../hooks/use-transaction-saved-views'
import type { TransactionSavedView } from '../lib/views'
import type { TransactionCopy } from './transaction-status'

type SavedViews = ReturnType<typeof useTransactionSavedViews>

export function TransactionSavedViews({
  savedViews,
  onSelect,
  t,
}: {
  savedViews: SavedViews
  onSelect: (view: TransactionSavedView | undefined) => void
  t: TransactionCopy
}) {
  return (
    <WorkspaceSavedViews
      label={t('savedViews')}
      hint={t('savedViewsHint')}
      defaultViewLabel={t('defaultView')}
      views={savedViews.views}
      activeViewId={savedViews.activeViewId}
      onSaveNew={() => savedViews.setSaveOpen(true)}
      onSelect={(view) => onSelect(savedViews.views.find((item) => item.id === view?.id))}
      onSetDefault={savedViews.setDefault}
      onDelete={savedViews.remove}
    />
  )
}

export function TransactionSaveViewDialog({ savedViews }: { savedViews: SavedViews }) {
  return (
    <SaveViewDialog
      open={savedViews.saveOpen}
      onOpenChange={savedViews.setSaveOpen}
      isPending={false}
      onSubmit={savedViews.save}
    />
  )
}
