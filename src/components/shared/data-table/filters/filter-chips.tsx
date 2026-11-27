'use client'

import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FieldTypeIcon, getFieldLabel } from './icons'
import type { FieldConfig, FilterCondition, FilterGroup } from './lib/types'

interface FilterChipsProps {
  value: FilterGroup
  onChange: (next: FilterGroup) => void
  fieldsConfig: ReadonlyArray<FieldConfig>
}

function formatDate(v: unknown): string {
  if (typeof v !== 'string' || !v) return String(v ?? '')
  // ISO `YYYY-MM-DD` from <input type="date"> → short readable. en-US lock (hydration-safe).
  const d = new Date(`${v}T00:00:00`)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function lookupEnumLabel(field: FieldConfig | undefined, value: unknown): string {
  if (field?.type !== 'enum') return String(value ?? '')
  const opt = field.options.find((o) => o.value === value)
  return opt?.label ?? String(value ?? '')
}

/**
 * Resolve condition value → human label. Aware of field type & operator:
 * - enum + (eq/neq/in/not_in) → resolve slug → label via field.options
 * - date + (eq/before/after) → short date
 * - between → "X — Y" (date-aware)
 * - last_n_days → "N days"
 * - array (in/not_in/has_any/has_all) → max 2 labels + "+N more"
 */
function formatValue(
  condition: FilterCondition,
  field: FieldConfig | undefined,
  t: ReturnType<typeof useTranslations>,
): string {
  const { value, operator } = condition
  if (value === null || value === undefined || value === '') return ''

  if (operator === 'last_n_days') {
    return t('durationDays', { count: Number(value) })
  }

  if (operator === 'between' && Array.isArray(value) && value.length === 2) {
    const [a, b] = value
    const fmt = field?.type === 'date' ? formatDate : (x: unknown) => String(x ?? '')
    return `${fmt(a)} — ${fmt(b)}`
  }

  if (Array.isArray(value)) {
    const labels = value.map((v) => lookupEnumLabel(field, v))
    if (labels.length <= 2) return labels.join(', ')
    return `${labels.slice(0, 2).join(', ')} ${t('moreValues', { count: labels.length - 2 })}`
  }

  if (field?.type === 'date') return formatDate(value)
  if (field?.type === 'enum') return lookupEnumLabel(field, value)
  return String(value)
}

export function FilterChips({ value, onChange, fieldsConfig }: FilterChipsProps) {
  const t = useTranslations('table')
  if (value.conditions.length === 0) return null

  const combinatorLabel = t(value.combinator)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.conditions.map((c, idx) => {
        const cfg = fieldsConfig.find((f) => f.id === c.field)
        const valueText = formatValue(c, cfg, t)
        return (
          <div key={c.id} className="flex items-center gap-1.5">
            {idx > 0 && (
              <span className="text-muted-foreground text-xs font-medium">{combinatorLabel}</span>
            )}
            <span
              className={
                'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/30 inline-flex items-center gap-1.5 rounded-md border py-1 pl-2 pr-1 text-xs transition-[background-color,border-color] duration-150'
              }
            >
              {cfg && <FieldTypeIcon type={cfg.type} className="text-primary/70 size-3" />}
              <span className="text-foreground font-medium">
                {getFieldLabel(fieldsConfig, c.field)}
              </span>
              <span className="text-muted-foreground">{t(`operators.${c.operator}`)}</span>
              {valueText && (
                <span className="bg-primary/10 text-foreground -mx-0.5 rounded-md px-1.5 py-px text-xs font-medium tabular-nums">
                  {valueText}
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    conditions: value.conditions.filter((_, i) => i !== idx),
                  })
                }
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-0.5 inline-flex size-4 items-center justify-center rounded-sm transition-colors"
                aria-label={t('removeFilter')}
              >
                <XIcon className="size-3" />
              </button>
            </span>
          </div>
        )
      })}
      {value.conditions.length > 1 && (
        <button
          type="button"
          onClick={() => onChange({ ...value, conditions: [] })}
          className="text-muted-foreground hover:text-destructive ml-1 text-xs font-medium underline-offset-2 hover:underline"
        >
          {t('clearAll')}
        </button>
      )}
    </div>
  )
}
