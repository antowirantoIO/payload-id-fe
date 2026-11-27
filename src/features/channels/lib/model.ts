import { z } from 'zod'
import { type Channel, channelCategories, channelDirections, channelStatuses } from '../contracts'
import { mockChannels } from './mock'

export { type Channel, channelCategories, channelDirections, channelStatuses } from '../contracts'
export { exportChannels } from './export'
export const draftSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(1).max(120),
  category: z.enum(channelCategories),
  direction: z.enum(channelDirections),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => (Intl.supportedValuesOf('currency') as string[]).includes(value)),
  status: z.enum(channelStatuses),
})
export type ChannelDraft = z.infer<typeof draftSchema>
export const emptyChannel = (): ChannelDraft => ({
  code: '',
  name: '',
  category: 'BANK_TRANSFER',
  direction: 'PAYIN',
  currency: 'IDR',
  status: 'ACTIVE',
})
export const makeChannels = (): Channel[] => mockChannels.map((row) => ({ ...row }))
export function validateChannel(draft: ChannelDraft, rows: Channel[], editingId?: string) {
  const existing = rows.find((row) => row.id === editingId)
  if (editingId && (!existing || existing.deleted_at))
    return { valid: false as const, error: 'unavailable' }
  const result = draftSchema.safeParse({ ...draft, code: existing?.code ?? draft.code })
  if (!result.success)
    return {
      valid: false as const,
      error: `validation.${String(result.error.issues[0]?.path[0] ?? 'name')}`,
    }
  if (
    rows.some(
      (row) => row.id !== editingId && row.code.toLowerCase() === result.data.code.toLowerCase(),
    )
  )
    return { valid: false as const, error: 'duplicate' }
  return { valid: true as const, data: result.data }
}
export function saveChannel(
  rows: Channel[],
  draft: ChannelDraft,
  id: string | undefined,
  newId: string,
  at: string,
) {
  const check = validateChannel(draft, rows, id)
  if (!check.valid) return { rows, error: check.error }
  return {
    error: null,
    rows: id
      ? rows.map((row) =>
          row.id === id ? { ...row, ...check.data, code: row.code, updated_at: at } : row,
        )
      : [{ ...check.data, id: newId, created_at: at, updated_at: at, deleted_at: null }, ...rows],
  }
}
export function transitionChannel(
  rows: Channel[],
  id: string,
  action: 'archive' | 'restore' | Channel['status'],
  at: string,
) {
  return rows.map((row) => {
    if (row.id !== id) return row
    if (action === 'restore')
      return row.deleted_at ? { ...row, deleted_at: null, updated_at: at } : row
    if (row.deleted_at) return row
    if (action === 'archive') return { ...row, deleted_at: at, updated_at: at }
    return channelStatuses.includes(action) ? { ...row, status: action, updated_at: at } : row
  })
}
export function filterChannels(rows: Channel[], search: string, includeArchived = false) {
  const terms = search
    .toLowerCase()
    .split(/[,;\n]/)
    .map((term) => term.trim())
    .filter(Boolean)
  return rows.filter(
    (row) =>
      (includeArchived || !row.deleted_at) &&
      (!terms.length ||
        terms.some((term) =>
          [
            row.code,
            row.name,
            row.category,
            row.direction,
            row.currency,
            row.provider_name ?? '',
            row.provider_code ?? '',
          ].some((value) => value.toLowerCase().includes(term)),
        )),
  )
}
