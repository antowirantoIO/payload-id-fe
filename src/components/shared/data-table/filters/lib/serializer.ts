/**
 * URL serializer utk FilterGroup.
 *
 * Format: compact string `combinator;field:op:value;field:op:value;…`
 *   - combinator: `and` | `or`
 *   - value: scalar (URL-encoded), array → comma-joined, range → `start~end`
 *   - operator gak butuh value (`is_known`, `is_true`, dll.) → field:op (tanpa value)
 *
 * Contoh:
 *   and;name:contains:TEST2;role:in:admin,member
 *   or;tags:has_any:vip,beta;created_at:between:2026-01-01~2026-12-31
 *
 * vs JSON.stringify: ~70% lebih pendek + readable di URL bar. Robust thd partial
 * parse — invalid token di-skip, bukan crash.
 */

import type { FilterCondition, FilterGroup, FilterOperator, FilterValue } from './types'
import { operatorNeedsArrayValue, operatorNeedsRangeValue, operatorNeedsValue } from './types'

const VALID_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  'eq',
  'neq',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'before',
  'after',
  'last_n_days',
  'in',
  'not_in',
  'has_any',
  'has_all',
  'is_true',
  'is_false',
  'is_known',
  'is_unknown',
])

const SEP_COND = ';'
const SEP_PART = ':'
const SEP_ARRAY = ','
const SEP_RANGE = '~'

/** Encode satu value jadi URL-safe string. */
function encodeValue(value: FilterValue, operator: FilterOperator): string {
  if (operatorNeedsRangeValue(operator)) {
    const v = Array.isArray(value) ? value : ['', '']
    return `${encodeURIComponent(String(v[0] ?? ''))}${SEP_RANGE}${encodeURIComponent(String(v[1] ?? ''))}`
  }
  if (operatorNeedsArrayValue(operator)) {
    const arr = Array.isArray(value) ? value : []
    return arr.map((v) => encodeURIComponent(String(v))).join(SEP_ARRAY)
  }
  if (value === null || value === undefined) return ''
  return encodeURIComponent(String(value))
}

function decodeValue(raw: string, operator: FilterOperator): FilterValue {
  if (!raw) return null
  if (operatorNeedsRangeValue(operator)) {
    const [a, b] = raw.split(SEP_RANGE)
    return [decodeURIComponent(a ?? ''), decodeURIComponent(b ?? '')]
  }
  if (operatorNeedsArrayValue(operator)) {
    return raw.split(SEP_ARRAY).map((v) => decodeURIComponent(v))
  }
  // Number-ish operators stay as string here — translator will coerce as needed.
  return decodeURIComponent(raw)
}

/** Serialize FilterGroup → compact URL string. EMPTY group → '' (cleared by nuqs). */
export function serializeFilterGroup(group: FilterGroup): string {
  if (group.conditions.length === 0) return ''
  const parts: string[] = [group.combinator]
  for (const c of group.conditions) {
    const valuePart = operatorNeedsValue(c.operator) ? encodeValue(c.value, c.operator) : ''
    // field:op  atau  field:op:value
    parts.push(
      valuePart
        ? `${c.field}${SEP_PART}${c.operator}${SEP_PART}${valuePart}`
        : `${c.field}${SEP_PART}${c.operator}`,
    )
  }
  return parts.join(SEP_COND)
}

/** Parse compact string back jadi FilterGroup. Robust: invalid token di-skip. */
export function parseFilterGroup(raw: string | null | undefined): FilterGroup {
  if (!raw) return { combinator: 'and', conditions: [] }

  const tokens = raw.split(SEP_COND)
  const head = tokens[0]
  const combinator: 'and' | 'or' = head === 'or' ? 'or' : 'and'

  const conditions: FilterCondition[] = []
  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (!token) continue
    // split jadi maks 3 bagian: field, op, valueRest (value boleh berisi `:`)
    const firstColon = token.indexOf(SEP_PART)
    if (firstColon === -1) continue
    const secondColon = token.indexOf(SEP_PART, firstColon + 1)
    const field = token.slice(0, firstColon)
    const op =
      secondColon === -1 ? token.slice(firstColon + 1) : token.slice(firstColon + 1, secondColon)
    const valueRaw = secondColon === -1 ? '' : token.slice(secondColon + 1)
    if (!field || !op) continue
    if (!VALID_OPERATORS.has(op as FilterOperator)) continue

    const operator = op as FilterOperator
    const value: FilterValue = operatorNeedsValue(operator) ? decodeValue(valueRaw, operator) : null
    conditions.push({
      id: `c${i}`,
      field,
      operator,
      value,
    })
  }

  return { combinator, conditions }
}

/**
 * Backward-compat / defensive: validate parsed object dari JSON (lama) jadi
 * FilterGroup. Dipakai sbg fallback bila URL legacy ?filterGroup={...} masih
 * di-bookmark. Tidak dipakai untuk new flow (sudah pakai parseFilterGroup).
 */
export function validateFilterGroup(raw: unknown): FilterGroup {
  // Tipe string → coba compact format dulu (new format)
  if (typeof raw === 'string') return parseFilterGroup(raw)
  if (!raw || typeof raw !== 'object') return { combinator: 'and', conditions: [] }
  const obj = raw as Record<string, unknown>

  const combinator = obj.combinator === 'or' ? 'or' : 'and'
  const conditionsRaw = Array.isArray(obj.conditions) ? obj.conditions : []

  const conditions = conditionsRaw
    .map((c, i) => validateCondition(c, i))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return { combinator, conditions }
}

function validateCondition(raw: unknown, index: number) {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.field !== 'string' || !obj.field) return null
  if (typeof obj.operator !== 'string') return null
  if (!VALID_OPERATORS.has(obj.operator as FilterOperator)) return null

  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : `cond-${index}`,
    field: obj.field,
    operator: obj.operator as FilterOperator,
    value: (obj.value ?? null) as FilterValue,
  }
}
