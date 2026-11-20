'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import { canTransition, type Merchant, type MerchantStatus, makeMerchants } from '../lib/model'

function useMerchantState() {
  const [rows, setRows] = useState(makeMerchants)
  const save = (merchant: Merchant) => {
    const at = new Date().toISOString()
    const saved = {
      ...merchant,
      id: merchant.id || crypto.randomUUID(),
      created_at: merchant.created_at || at,
      updated_at: at,
      history: [
        ...merchant.history,
        {
          at,
          message: merchant.id ? 'Business profile updated.' : 'Merchant created as DRAFT.',
        },
      ],
    }
    setRows((previous) =>
      merchant.id
        ? previous.map((row) => (row.id === merchant.id ? saved : row))
        : [saved, ...previous],
    )
    return saved.id
  }
  const changeStatus = (ids: string[], status: MerchantStatus, reason: string) => {
    const targets = rows.filter((row) => ids.includes(row.id))
    if (
      targets.length !== ids.length ||
      !canTransition(targets, status) ||
      reason.trim().length < 3
    )
      return false
    const at = new Date().toISOString()
    setRows((previous) =>
      previous.map((row) =>
        ids.includes(row.id)
          ? {
              ...row,
              status,
              updated_at: at,
              history: [
                ...row.history,
                { at, message: `${row.status} → ${status}. Reason: ${reason.trim()}` },
              ],
            }
          : row,
      ),
    )
    return true
  }
  return { rows, save, changeStatus }
}

const MerchantContext = createContext<ReturnType<typeof useMerchantState> | null>(null)

export function MerchantDemoProvider({ children }: { children: ReactNode }) {
  const value = useMerchantState()
  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>
}

export function useMerchantDemo() {
  const value = useContext(MerchantContext)
  if (!value) throw new Error('MerchantDemoProvider is required')
  return value
}
