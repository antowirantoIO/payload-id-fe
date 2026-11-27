import { useState } from 'react'
import type { Transaction } from '../contracts'

export function useTransactionDetail() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  function inspect(row: Transaction) {
    setSelected(row)
    setCopied(false)
    setCopyFailed(false)
  }
  async function copyReference() {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.platform_reference_id)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
    }
  }
  return { selected, copied, copyFailed, inspect, copyReference, close: () => setSelected(null) }
}
