'use client'
import { useRef, useState } from 'react'
import {
  type Channel,
  type ChannelDraft,
  makeChannels,
  saveChannel,
  transitionChannel,
} from '../lib/model'
export function useChannelWorkspace(permissions: string[]) {
  const [rows, setRows] = useState(makeChannels)
  const current = useRef(rows)
  const [notice, setNotice] = useState('')
  const can = (action: 'create' | 'update' | 'delete') => permissions.includes(`channel.${action}`)
  const commit = (next: Channel[]) => {
    current.current = next
    setRows(next)
  }
  const save = (draft: ChannelDraft, id?: string) => {
    if (!can(id ? 'update' : 'create')) return 'forbidden'
    const result = saveChannel(
      current.current,
      draft,
      id,
      crypto.randomUUID(),
      new Date().toISOString(),
    )
    if (result.error) return result.error
    commit(result.rows)
    setNotice('saved')
    return null
  }
  const act = (id: string, action: 'archive' | 'restore' | Channel['status']) => {
    if (!can(action === 'archive' ? 'delete' : 'update')) return
    commit(transitionChannel(current.current, id, action, new Date().toISOString()))
    setNotice(
      action === 'archive' ? 'deleted' : action === 'restore' ? 'restored' : 'statusUpdated',
    )
  }
  return { rows, save, act, notice, setNotice, can }
}
