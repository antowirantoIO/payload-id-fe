'use client'

import { useTranslations } from 'next-intl'

import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { FieldConfig, FilterOperator, FilterValue } from './lib/types'
import { operatorNeedsArrayValue, operatorNeedsRangeValue, operatorNeedsValue } from './lib/types'

interface FilterValueInputProps {
  field: FieldConfig
  operator: FilterOperator
  value: FilterValue
  onChange: (value: FilterValue) => void
}

/**
 * Render value editor sesuai field type & operator. Kalau operator gak butuh
 * value (is_known, is_true, dll.) → return null (caller skip render).
 */
export function FilterValueInput({ field, operator, value, onChange }: FilterValueInputProps) {
  const t = useTranslations('table')
  const id = useId()

  if (!operatorNeedsValue(operator)) return null

  // Range — `between`
  if (operatorNeedsRangeValue(operator)) {
    const v = Array.isArray(value) ? (value as [string, string]) : ['', '']
    const isDate = field.type === 'date'
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type={isDate ? (field.includeTime ? 'datetime-local' : 'date') : 'number'}
          aria-label={t('rangeStart', {
            field: field.label,
            timezone: field.includeTime ? ' (UTC)' : '',
          })}
          value={String(v[0] ?? '')}
          onChange={(e) => onChange([e.target.value, v[1] ?? ''])}
          className={field.includeTime ? 'h-9 w-52 text-xs' : 'h-9 w-28 text-xs'}
          placeholder={t('start')}
        />
        <span className="text-muted-foreground text-xs">—</span>
        <Input
          type={isDate ? (field.includeTime ? 'datetime-local' : 'date') : 'number'}
          aria-label={t('rangeEnd', {
            field: field.label,
            timezone: field.includeTime ? ' (UTC)' : '',
          })}
          value={String(v[1] ?? '')}
          onChange={(e) => onChange([v[0] ?? '', e.target.value])}
          className={field.includeTime ? 'h-9 w-52 text-xs' : 'h-9 w-28 text-xs'}
          placeholder={t('end')}
        />
      </div>
    )
  }

  // Array — in / not_in / has_any / has_all
  if (operatorNeedsArrayValue(operator)) {
    if (field.type === 'enum') {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="flex flex-wrap gap-1">
          {field.options.map((opt) => {
            const checked = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange(
                    checked ? selected.filter((s) => s !== opt.value) : [...selected, opt.value],
                  )
                }
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-[color,background-color,border-color] duration-150 ${
                  checked
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/40'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )
    }

    // tags / generic — comma-separated input
    const arr = Array.isArray(value) ? (value as string[]) : []
    return (
      <Input
        value={arr.join(', ')}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className="h-8 w-48 text-xs"
        placeholder={t('valuesPlaceholder')}
      />
    )
  }

  // Boolean toggle (technically only is_true / is_false handled above; fallback)
  if (field.type === 'boolean') {
    return (
      <Switch id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
    )
  }

  // last_n_days — number
  if (operator === 'last_n_days') {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          value={String(value ?? '')}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 w-20 text-xs"
        />
        <span className="text-muted-foreground text-xs">{t('days')}</span>
      </div>
    )
  }

  // Date single
  if (field.type === 'date') {
    return (
      <Input
        type={field.includeTime ? 'datetime-local' : 'date'}
        aria-label={`${field.label}${field.includeTime ? ' (UTC)' : ''}`}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className={field.includeTime ? 'h-9 w-52 text-xs' : 'h-9 w-36 text-xs'}
      />
    )
  }

  // Number single
  if (field.type === 'number') {
    return (
      <Input
        type="number"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="h-8 w-32 text-xs"
      />
    )
  }

  // Text default
  return (
    <Input
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-48 text-xs"
      placeholder={t('value')}
    />
  )
}
