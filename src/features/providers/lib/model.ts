import type { FilterGroup } from '@/components/shared/data-table/filters'
import type { Provider as ProviderContract, ProviderStatus } from '../contracts'
import { mockProviders } from './mock'

export type { ProviderStatus } from '../contracts'
export type Activity =
  | 'created'
  | 'updated'
  | 'statusUpdated'
  | 'archivedNotice'
  | 'restoredNotice'
  | 'localChecked'
  | 'credentialUpdated'
export type Provider = ProviderContract & {
  deleted_at: string | null
  history: { at: string; message: Activity }[]
  local_check?: 'valid' | 'invalid'
}
export type ProviderInput = Pick<Provider, 'code' | 'name' | 'base_url' | 'status'>
export const providerStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const
export function providerHost(value: string) {
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}
export function healthTone(status: string) {
  return status === 'HEALTHY'
    ? 'success'
    : status === 'DOWN'
      ? 'danger'
      : status === 'DEGRADED'
        ? 'warning'
        : 'neutral'
}
export function statusTone(status: string) {
  return status === 'ACTIVE' ? 'success' : status === 'MAINTENANCE' ? 'warning' : 'neutral'
}
export function filterProviders<T extends ProviderContract>(
  rows: T[],
  search: string,
  status?: string,
  health?: string,
) {
  const terms = search
    .toLowerCase()
    .split(/[,;\n]/)
    .map((term) => term.trim())
    .filter(Boolean)
  return rows.filter(
    (row) =>
      (!terms.length ||
        terms.some((term) =>
          [row.code, row.name, row.base_url].some((value) => value.toLowerCase().includes(term)),
        )) &&
      (!status || row.status === status) &&
      (!health || row.health_status === health),
  )
}
export function matchesProviderFilter(row: Provider, filter: FilterGroup, now = Date.now()) {
  const matches = filter.conditions.map(({ field, operator, value }) => {
    const actual =
      field === 'status'
        ? row.status
        : field === 'health_status'
          ? row.health_status
          : field === 'created_at'
            ? row.created_at
            : field === 'updated_at'
              ? row.updated_at
              : ''
    const values = Array.isArray(value) ? value.map(String) : [String(value ?? '')]
    switch (operator) {
      case 'in':
        return values.includes(actual)
      case 'not_in':
        return !values.includes(actual)
      case 'is_known':
        return !!actual
      case 'is_unknown':
        return !actual
      case 'eq':
        return actual.slice(0, 10) === values[0].slice(0, 10)
      case 'before':
        return Date.parse(actual) < Date.parse(values[0])
      case 'after':
        return Date.parse(actual) > Date.parse(values[0])
      case 'between':
        return (
          Date.parse(actual) >= Date.parse(values[0]) && Date.parse(actual) <= Date.parse(values[1])
        )
      case 'last_n_days':
        return Date.parse(actual) >= now - Number(value) * 86400000 && Date.parse(actual) <= now
      default:
        return false
    }
  })
  return (
    !matches.length ||
    (filter.combinator === 'and' ? matches.every(Boolean) : matches.some(Boolean))
  )
}
function validUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === 'https:' &&
      !!url.hostname &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}
export function validateProvider(
  input: ProviderInput,
  existing: Provider[] = [],
  editingId?: string,
) {
  const errors: Partial<Record<keyof ProviderInput | 'required', string>> = {}
  if (!input.code.trim() || !input.name.trim() || !input.base_url.trim())
    errors.required = 'required'
  if (
    existing.some(
      (row) =>
        row.id !== editingId && row.code.trim().toLowerCase() === input.code.trim().toLowerCase(),
    )
  )
    errors.code = 'duplicateCode'
  if (!validUrl(input.base_url)) errors.base_url = 'invalidUrl'
  if (!providerStatuses.some((status) => status === input.status)) errors.status = 'invalidStatus'
  return errors
}
export function testProviderConnection(provider: Pick<Provider, 'base_url'>): 'valid' | 'invalid' {
  return validUrl(provider.base_url) ? 'valid' : 'invalid'
}
export function makeProviders(): Provider[] {
  return mockProviders.map((row) => ({
    ...row,
    metadata: { ...row.metadata },
    channels: row.channels.map((channel) => ({ ...channel })),
    supported_currencies: [...row.supported_currencies],
    credential_keys: [...row.credential_keys],
    deleted_at: row.status === 'ARCHIVED' ? row.updated_at : null,
    history: [],
  }))
}
export function createProvider(input: ProviderInput, id: string, at: string): Provider {
  return {
    ...input,
    code: input.code.trim(),
    name: input.name.trim(),
    base_url: input.base_url.trim(),
    id,
    description: null,
    base_url_sandbox: null,
    health_status: 'UNTESTED',
    health_checked_at: null,
    supported_currencies: [],
    metadata: {},
    channel_count: 0,
    channels: [],
    credential_keys: [],
    created_at: at,
    updated_at: at,
    deleted_at: null,
    history: [{ at, message: 'created' }],
  }
}
export function updateProvider(row: Provider, input: ProviderInput, at: string): Provider {
  if (row.deleted_at) return row
  return {
    ...row,
    name: input.name.trim(),
    base_url: input.base_url.trim(),
    status: input.status,
    local_check: undefined,
    updated_at: at,
    history: [...row.history, { at, message: 'updated' }],
  }
}
export function transitionProvider(
  row: Provider,
  action: 'delete' | 'restore' | ProviderStatus,
  at: string,
): Provider {
  if (action === 'delete') {
    if (row.deleted_at) return row
    return {
      ...row,
      deleted_at: at,
      updated_at: at,
      history: [...row.history, { at, message: 'archivedNotice' }],
    }
  }
  if (action === 'restore') {
    if (!row.deleted_at) return row
    return {
      ...row,
      deleted_at: null,
      status: row.status === 'ARCHIVED' ? 'INACTIVE' : row.status,
      updated_at: at,
      history: [...row.history, { at, message: 'restoredNotice' }],
    }
  }
  if (row.deleted_at || !providerStatuses.some((status) => status === action)) return row
  return {
    ...row,
    status: action,
    updated_at: at,
    history: [...row.history, { at, message: 'statusUpdated' }],
  }
}
