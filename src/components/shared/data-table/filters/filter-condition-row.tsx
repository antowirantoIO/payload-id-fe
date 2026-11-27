'use client'

import { TrashIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterValueInput } from './filter-value-input'
import { FieldTypeIcon } from './icons'
import type { FieldConfig, FilterCondition } from './lib/types'
import { OPERATORS_BY_TYPE } from './lib/types'

interface FilterConditionRowProps {
  condition: FilterCondition
  fieldsConfig: ReadonlyArray<FieldConfig>
  onChange: (next: FilterCondition) => void
  onRemove: () => void
}

export function FilterConditionRow({
  condition,
  fieldsConfig,
  onChange,
  onRemove,
}: FilterConditionRowProps) {
  const t = useTranslations('table')
  const field = fieldsConfig.find((f) => f.id === condition.field) ?? fieldsConfig[0]
  if (!field) return null

  const operators = OPERATORS_BY_TYPE[field.type]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={field.id}
        onValueChange={(value) => {
          const next = fieldsConfig.find((f) => f.id === value)
          if (!next) return
          // Reset operator ke default field baru (pertama dari list)
          const nextOp = OPERATORS_BY_TYPE[next.type][0]
          onChange({
            ...condition,
            field: next.id,
            operator: nextOp,
            value: null,
          })
        }}
      >
        <SelectTrigger aria-label={t('filterField')} size="sm" className="h-9 w-[160px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fieldsConfig.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span className="flex items-center gap-2">
                <FieldTypeIcon type={f.type} className="text-muted-foreground size-3.5" />
                {f.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(value) =>
          onChange({
            ...condition,
            operator: value as FilterCondition['operator'],
            value: null,
          })
        }
      >
        <SelectTrigger aria-label={t('filterOperator')} size="sm" className="h-9 w-[150px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {t(`operators.${op}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FilterValueInput
        field={field}
        operator={condition.operator}
        value={condition.value}
        onChange={(value) => onChange({ ...condition, value })}
      />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive ml-auto h-8 w-8"
        aria-label={t('removeCondition')}
      >
        <TrashIcon className="size-3.5" />
      </Button>
    </div>
  )
}
