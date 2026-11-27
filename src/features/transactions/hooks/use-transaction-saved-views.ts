import { useState } from 'react'
import {
  snapshotTransactionView,
  type TransactionSavedView,
  type TransactionViewState,
} from '../lib/views'

// Deliberately local to the mounted page; quick filters alone live in Zustand.
export function useTransactionSavedViews(state: TransactionViewState) {
  const [views, setViews] = useState<TransactionSavedView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  function save({ name, isDefault }: { name: string; isDefault: boolean }) {
    const id = crypto.randomUUID()
    const snapshot = snapshotTransactionView(state)
    setViews((previous) => [
      ...previous.map((view) => (isDefault ? { ...view, is_default: false } : view)),
      { id, name, is_default: isDefault, ...snapshot },
    ])
    setActiveViewId(id)
    setSaveOpen(false)
  }
  function setDefault(view: { id: string }) {
    setViews((previous) => previous.map((item) => ({ ...item, is_default: item.id === view.id })))
  }
  function remove(view: { id: string }) {
    setViews((previous) => previous.filter((item) => item.id !== view.id))
    if (activeViewId === view.id) setActiveViewId(null)
  }
  return { views, activeViewId, setActiveViewId, saveOpen, setSaveOpen, save, setDefault, remove }
}
