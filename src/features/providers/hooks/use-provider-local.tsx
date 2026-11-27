'use client'
import { useRef, useState } from 'react'
import {
  createProvider,
  makeProviders,
  type Provider,
  type ProviderInput,
  type ProviderStatus,
  testProviderConnection,
  transitionProvider,
  updateProvider,
  validateProvider,
} from '../lib/model'
export function useProviderLocal(permissions: string[]) {
  const [rows, setRows] = useState<Provider[]>(makeProviders)
  const current = useRef(rows)
  const commit = (next: Provider[]) => {
    current.current = next
    setRows(next)
  }
  const can = (permission: string) => permissions.includes(permission)
  const save = (input: ProviderInput, id?: string) => {
    if (!can(id ? 'issuer.update' : 'issuer.create')) return { errors: { required: 'forbidden' } }
    const row = current.current.find((item) => item.id === id)
    if (id && (!row || row.deleted_at)) return { errors: { required: 'forbidden' } }
    const errors = validateProvider(input, current.current, id)
    if (Object.keys(errors).length) return { errors }
    const at = new Date().toISOString()
    commit(
      id
        ? current.current.map((item) => (item.id === id ? updateProvider(item, input, at) : item))
        : [createProvider(input, crypto.randomUUID(), at), ...current.current],
    )
    return { errors: {} }
  }
  const act = (id: string, action: 'delete' | 'restore' | ProviderStatus) => {
    if (!can(action === 'delete' ? 'issuer.delete' : 'issuer.update')) return
    const at = new Date().toISOString()
    commit(
      current.current.map((row) => (row.id === id ? transitionProvider(row, action, at) : row)),
    )
  }
  const test = (id: string) => {
    const row = current.current.find((item) => item.id === id)
    if (!can('issuer.update') || !row || row.deleted_at) return
    const result = testProviderConnection(row)
    const at = new Date().toISOString()
    commit(
      current.current.map((item) =>
        item.id === id
          ? {
              ...item,
              local_check: result,
              history: [...item.history, { at, message: 'localChecked' }],
            }
          : item,
      ),
    )
    return result
  }
  const credential = (id: string, name: string, remove: boolean) => {
    if (
      !can(remove ? 'issuer_credential.delete' : 'issuer_credential.create') ||
      !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(name)
    )
      return
    const at = new Date().toISOString()
    commit(
      current.current.map((row) =>
        row.id !== id || row.deleted_at
          ? row
          : {
              ...row,
              credential_keys: remove
                ? row.credential_keys.filter((key) => key !== name)
                : [...new Set([...row.credential_keys, name])],
              updated_at: at,
              history: [...row.history, { at, message: 'credentialUpdated' }],
            },
      ),
    )
  }
  return {
    rows,
    save,
    changeStatus: (id: string, status: ProviderStatus) => act(id, status),
    remove: (id: string) => act(id, 'delete'),
    restore: (id: string) => act(id, 'restore'),
    test,
    credential,
  }
}
