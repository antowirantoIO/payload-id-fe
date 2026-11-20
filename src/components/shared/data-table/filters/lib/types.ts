/**
 * Filter DSL — generic, type-safe, serializable.
 *
 * Konsep: consumer (mis. users feature) mendaftar `FieldConfig[]` per kolom yang
 * bisa di-filter. UI filter builder dan Supabase translator dua-duanya membaca
 * config ini → UI cuma render operator yang valid utk tipe field, dan translator
 * cuma generate query yang valid utk operator yang dipilih.
 *
 * Format URL: kompak base64-of-JSON via parseAsString utk hemat karakter.
 * Lebih kompak drpd parseAsJson default karena bisa hilangkan field default.
 */

export type FilterFieldType = 'text' | 'number' | 'date' | 'enum' | 'boolean' | 'tags'

export interface BaseFieldConfig {
  includeTime?: boolean
  /** Identifier kolom DB. Dipakai sbg key di `Supabase.eq(field, ...)`. */
  id: string
  /** Label yg ditampilkan di UI dropdown field picker. */
  label: string
  /** Icon optional (lucide name). Renderer-side opt. */
  icon?: string
}

export type FieldConfig =
  | (BaseFieldConfig & { type: 'text' })
  | (BaseFieldConfig & { type: 'number' })
  | (BaseFieldConfig & { type: 'date' })
  | (BaseFieldConfig & { type: 'enum'; options: ReadonlyArray<{ value: string; label: string }> })
  | (BaseFieldConfig & { type: 'boolean' })
  | (BaseFieldConfig & { type: 'tags' })

/** Operator strings — short form utk URL (`eq`, `neq`, `gt`, dll). */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'
  | 'last_n_days'
  | 'in'
  | 'not_in'
  | 'has_any'
  | 'has_all'
  | 'is_true'
  | 'is_false'
  | 'is_known'
  | 'is_unknown'

export const OPERATORS_BY_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: [
    'contains',
    'not_contains',
    'eq',
    'neq',
    'starts_with',
    'ends_with',
    'is_known',
    'is_unknown',
  ],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'is_known', 'is_unknown'],
  date: ['eq', 'before', 'after', 'between', 'last_n_days', 'is_known', 'is_unknown'],
  enum: ['in', 'not_in', 'is_known', 'is_unknown'],
  boolean: ['is_true', 'is_false'],
  tags: ['has_any', 'has_all', 'is_known', 'is_unknown'],
}

/** Operator label utk UI (HubSpot-style). */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'is',
  neq: 'is not',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  gt: 'greater than',
  gte: 'greater than or equal',
  lt: 'less than',
  lte: 'less than or equal',
  between: 'between',
  before: 'before',
  after: 'after',
  last_n_days: 'in the last',
  in: 'is any of',
  not_in: 'is none of',
  has_any: 'has any of',
  has_all: 'has all of',
  is_true: 'is true',
  is_false: 'is false',
  is_known: 'is known',
  is_unknown: 'is unknown',
}

/**
 * Single condition. Value bisa string, number, boolean, [start, end] (between),
 * atau string[] (in/not_in/has_any/has_all). null utk is_known/is_unknown.
 */
export interface FilterCondition {
  /** Stable id utk React key (generated client-side, NOT persisted ke DB). */
  id: string
  field: string
  operator: FilterOperator
  value: FilterValue
}

export type FilterValue =
  string | number | boolean | null | [string | number, string | number] | string[]

/** Group AND/OR — flat (1 level), cukup utk 95% use-case HubSpot-style. */
export interface FilterGroup {
  combinator: 'and' | 'or'
  conditions: FilterCondition[]
}

export const EMPTY_FILTER: FilterGroup = { combinator: 'and', conditions: [] }

/**
 * Cek apakah operator butuh value input (false utk is_true/is_false/is_known/is_unknown).
 */
export function operatorNeedsValue(op: FilterOperator): boolean {
  return op !== 'is_true' && op !== 'is_false' && op !== 'is_known' && op !== 'is_unknown'
}

export function operatorNeedsRangeValue(op: FilterOperator): boolean {
  return op === 'between'
}

export function operatorNeedsArrayValue(op: FilterOperator): boolean {
  return op === 'in' || op === 'not_in' || op === 'has_any' || op === 'has_all'
}
