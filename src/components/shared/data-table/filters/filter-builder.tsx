'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { FilterIcon, PlusIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FilterConditionRow } from './filter-condition-row'
import type { FieldConfig, FilterGroup } from './lib/types'
import { OPERATORS_BY_TYPE } from './lib/types'

interface FilterBuilderProps {
  value: FilterGroup
  onChange: (next: FilterGroup) => void
  fieldsConfig: ReadonlyArray<FieldConfig>
  triggerLabel?: string
}

let conditionIdCounter = 0
function newConditionId() {
  conditionIdCounter += 1
  return `c${conditionIdCounter}`
}

export function FilterBuilder({ value, onChange, fieldsConfig, triggerLabel }: FilterBuilderProps) {
  const t = useTranslations('table')
  const count = value.conditions.length
  const hasFilters = count > 0

  function addCondition() {
    const first = fieldsConfig[0]
    if (!first) return
    onChange({
      ...value,
      conditions: [
        ...value.conditions,
        {
          id: newConditionId(),
          field: first.id,
          operator: OPERATORS_BY_TYPE[first.type][0],
          value: null,
        },
      ],
    })
  }

  function removeCondition(idx: number) {
    onChange({ ...value, conditions: value.conditions.filter((_, i) => i !== idx) })
  }

  function updateCondition(idx: number, next: (typeof value.conditions)[number]) {
    onChange({
      ...value,
      conditions: value.conditions.map((c, i) => (i === idx ? next : c)),
    })
  }

  function clearAll() {
    onChange({ combinator: value.combinator, conditions: [] })
  }

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-1.5 text-xs font-medium',
              hasFilters && 'border-primary/40 bg-primary/5 text-foreground',
            )}
          >
            <FilterIcon className="size-3.5" />
            {triggerLabel ?? t('filters')}
            {hasFilters && (
              <span className="bg-primary text-primary-foreground ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums">
                {count}
              </span>
            )}
          </Button>
        }
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="bottom" align="start" sideOffset={8} className="z-40">
          <PopoverPrimitive.Popup
            className={cn(
              'bg-popover text-popover-foreground border-border/60 relative z-40 w-[720px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border shadow-2xl outline-none',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            )}
          >
            {/* Header */}
            <div className="border-border/60 flex items-start justify-between gap-4 border-b px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary ring-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1">
                  <SlidersHorizontalIcon className="size-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold leading-none tracking-tight">
                    {t('moreFiltersLabel')}
                  </h4>
                  <p className="text-muted-foreground text-xs">{t('filterDescription')}</p>
                </div>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-muted-foreground hover:text-destructive shrink-0 text-xs font-medium underline-offset-2 transition-colors hover:underline"
                >
                  {t('clearAll')}
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-[55vh] overflow-y-auto">
              {!hasFilters ? (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
                  <div className="bg-muted/60 text-muted-foreground flex size-10 items-center justify-center rounded-full">
                    <FilterIcon className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground text-sm font-medium">{t('noConditions')}</p>
                    <p className="text-muted-foreground text-xs">{t('addConditionHint')}</p>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <div className="mb-3 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{t('match')}</span>
                    <Select
                      value={t(value.combinator).toLowerCase()}
                      onValueChange={(v) => onChange({ ...value, combinator: v as 'and' | 'or' })}
                    >
                      <SelectTrigger size="sm" className="h-7 w-[80px] text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">{t('matchAll')}</SelectItem>
                        <SelectItem value="or">{t('matchAny')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">{t('following')}</span>
                  </div>

                  <div className="space-y-2">
                    {value.conditions.map((c, idx) => (
                      <div
                        key={c.id}
                        className="bg-muted/30 hover:bg-muted/60 hover:border-border/80 group/row relative rounded-lg border border-transparent p-2.5 transition-[background-color,border-color] duration-150"
                      >
                        {idx > 0 && (
                          <div className="bg-popover border-border/60 text-muted-foreground absolute -top-[11px] left-3 z-10 flex h-5 items-center rounded-full border px-1.5 text-xs font-medium">
                            {t(value.combinator).toLowerCase()}
                          </div>
                        )}
                        <FilterConditionRow
                          condition={c}
                          fieldsConfig={fieldsConfig}
                          onChange={(next) => updateCondition(idx, next)}
                          onRemove={() => removeCondition(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-surface/50 border-border/60 flex items-center justify-between gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={addCondition}
                className="text-foreground h-8 gap-1.5 text-xs font-medium"
              >
                <PlusIcon className="size-3.5" />
                {t('addCondition')}
              </Button>
              <PopoverPrimitive.Close
                render={<Button size="sm" className="h-8 px-4 text-xs font-medium" />}
              >
                {t('done')}
              </PopoverPrimitive.Close>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
