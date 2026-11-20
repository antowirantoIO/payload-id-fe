import type { FilterCondition, FilterGroup } from '@/components/shared/data-table/filters'

function utcTime(value: string) {
  return Date.parse(value && !/(Z|[+-]\d\d:\d\d)$/.test(value) ? `${value}Z` : value)
}

function matches<TData>(row: TData, condition: FilterCondition) {
  const raw = row[condition.field as keyof TData]
  const value = raw == null ? '' : String(raw)
  const input = String(condition.value ?? '')
  const lower = value.toLowerCase()
  const target = input.toLowerCase()
  switch (condition.operator) {
    case 'is_known':
      return raw != null && value !== ''
    case 'is_unknown':
      return raw == null || value === ''
    case 'contains':
      return lower.includes(target)
    case 'not_contains':
      return !lower.includes(target)
    case 'starts_with':
      return lower.startsWith(target)
    case 'ends_with':
      return lower.endsWith(target)
    case 'eq':
      return condition.field.endsWith('_at')
        ? input.length <= 10
          ? value.slice(0, 10) === input
          : Math.floor(utcTime(value) / 60000) === Math.floor(utcTime(input) / 60000)
        : lower === target
    case 'neq':
      return lower !== target
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(value)
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(value)
    case 'gt':
      return Number(value) > Number(input)
    case 'gte':
      return Number(value) >= Number(input)
    case 'lt':
      return Number(value) < Number(input)
    case 'lte':
      return Number(value) <= Number(input)
    case 'before':
      return utcTime(value) < utcTime(input)
    case 'after':
      return utcTime(value) > utcTime(input)
    case 'between': {
      if (!Array.isArray(condition.value)) return false
      const [start, end] = condition.value
      return condition.field.endsWith('_at')
        ? utcTime(value) >= utcTime(String(start)) && utcTime(value) <= utcTime(String(end))
        : Number(value) >= Number(start) && Number(value) <= Number(end)
    }
    case 'last_n_days':
      return (
        Date.parse(value) >= Date.now() - Number(input) * 86400000 &&
        Date.parse(value) <= Date.now()
      )
    default:
      return false
  }
}

export function applyTableFilter<TData>(rows: TData[], group: FilterGroup) {
  if (!group.conditions.length) return rows
  const quick = group.conditions.filter((condition) => condition.id.startsWith('quick-'))
  const advanced = group.conditions.filter((condition) => !condition.id.startsWith('quick-'))
  return rows.filter(
    (row) =>
      quick.every((condition) => matches(row, condition)) &&
      (!advanced.length ||
        (group.combinator === 'and'
          ? advanced.every((condition) => matches(row, condition))
          : advanced.some((condition) => matches(row, condition)))),
  )
}
