'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import {
  deleteRouting,
  makeRoutingFixtures,
  restoreRouting,
  saveRouting,
  updateRoutingStatus,
} from '../lib/model'
import type { RoutingInput, RoutingRecord, RoutingStatus } from '../schemas/contracts'

function useRoutingState() {
  const [rows, setRows] = useState(makeRoutingFixtures)
  const [deleted, setDeleted] = useState<RoutingRecord[]>([])
  return {
    rows,
    deleted,
    save: (input: RoutingInput, id?: string) => {
      const next = saveRouting(rows, input, id)
      setRows(next)
      return id ? next.find((row) => row.id === id)! : next[0]
    },
    changeStatus: (id: string, status: RoutingStatus) =>
      setRows((current) => updateRoutingStatus(current, id, status)),
    remove: (id: string) => {
      const row = rows.find((item) => item.id === id)
      if (row) setDeleted((current) => [row, ...current])
      setRows((current) => deleteRouting(current, id))
    },
    restore: (id: string) => {
      const row = deleted.find((item) => item.id === id)
      if (row) {
        saveRouting(rows, row)
        setRows((current) => restoreRouting(current, row))
        setDeleted((current) => current.filter((item) => item.id !== id))
      }
    },
  }
}
const RoutingContext = createContext<ReturnType<typeof useRoutingState> | null>(null)
export function RoutingDemoProvider({ children }: { children: ReactNode }) {
  return <RoutingContext.Provider value={useRoutingState()}>{children}</RoutingContext.Provider>
}
export function useRoutingDemo() {
  const value = useContext(RoutingContext)
  if (!value) throw new Error('RoutingDemoProvider is required')
  return value
}
