'use client'

import type { Table } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { DataTableViewOptions } from '@/components/shared/data-table'
import {
  type FieldConfig,
  FilterBuilder,
  FilterChips,
  type FilterGroup,
} from '@/components/shared/data-table/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSearch, PeriodFilter } from './workspace-controls'

export function WorkspaceToolbar<TData>({
  table,
  search,
  onSearch,
  filter,
  onFilter,
  sort,
  onSort,
  density,
  onDensityChange,
  savedViews,
  onReset,
  fields,
  quickFields,
  sortOptions,
  searchLabel,
  searchPlaceholder,
  multiSearchPlaceholder,
  multiSearchApplyLabel,
  multiSearchDescription,
}: {
  table: Table<TData>
  search: string
  onSearch: (value: string) => void
  filter: FilterGroup
  onFilter: (value: FilterGroup) => void
  sort: string
  onSort: (value: string) => void
  density: 'compact' | 'normal' | 'comfortable'
  onDensityChange: (value: 'compact' | 'normal' | 'comfortable') => void
  savedViews: ReactNode
  onReset: () => void
  fields: FieldConfig[]
  quickFields: string[]
  sortOptions: { value: string; label: string }[]
  searchLabel?: string
  searchPlaceholder?: string
  multiSearchPlaceholder?: string
  multiSearchApplyLabel?: string
  multiSearchDescription?: string
}) {
  const t = useTranslations('transactions')
  const terms = [
    ...new Set(
      search
        .split(/[,;\n]+/)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={searchLabel ?? t('search')}
              placeholder={
                terms.length > 1
                  ? t('searchCount', { count: terms.length })
                  : (searchPlaceholder ?? t('searchPlaceholder'))
              }
              value={terms.length > 1 ? '' : search}
              readOnly={terms.length > 1}
              onChange={(event) => onSearch(event.target.value)}
              onPaste={(event) => {
                const text = event.clipboardData.getData('text')
                if (/[\n;]/.test(text)) {
                  event.preventDefault()
                  onSearch([search, text.replace(/[\n;]+/g, ', ')].filter(Boolean).join(', '))
                }
              }}
              className="h-10 pl-8 text-sm"
            />
          </div>
          <MultiSearch
            search={search}
            onSearch={onSearch}
            placeholder={multiSearchPlaceholder}
            applyLabel={multiSearchApplyLabel}
            description={multiSearchDescription}
          />
          {terms.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onSearch('')}>
              {t('clearSearch')}
            </Button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {savedViews}
          <DataTableViewOptions
            table={table}
            density={density}
            onDensityChange={onDensityChange}
            enableColumnPinning
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
        <PeriodFilter filter={filter} onFilter={onFilter} />
        {quickFields.map((field) => {
          const config = fields.find((item) => item.id === field)
          if (config?.type !== 'enum') return null
          const current = filter.conditions.find((item) => item.id === `quick-${field}`)
          const value = Array.isArray(current?.value) ? String(current.value[0]) : 'all'
          return (
            <Select
              key={field}
              value={value}
              onValueChange={(next) => {
                if (!next) return
                const conditions = filter.conditions.filter((item) => item.id !== `quick-${field}`)
                onFilter({
                  ...filter,
                  conditions:
                    next === 'all'
                      ? conditions
                      : [
                          ...conditions,
                          { id: `quick-${field}`, field, operator: 'in', value: [next] },
                        ],
                })
              }}
            >
              <SelectTrigger aria-label={config.label} className="h-9 w-auto min-w-32 text-sm">
                <SelectValue>
                  {value === 'all'
                    ? config.label
                    : config.options.find((item) => item.value === value)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                {config.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
        <FilterBuilder
          value={{
            ...filter,
            conditions: filter.conditions.filter((item) => !item.id.startsWith('quick-')),
          }}
          onChange={(next) =>
            onFilter({
              ...next,
              conditions: [
                ...filter.conditions.filter((item) => item.id.startsWith('quick-')),
                ...next.conditions,
              ],
            })
          }
          fieldsConfig={fields}
          triggerLabel={t('moreFiltersLabel')}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          {(filter.conditions.length > 0 || search) && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              {t('reset')}
            </Button>
          )}
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value) onSort(value)
            }}
          >
            <SelectTrigger aria-label={t('sort')} className="h-9 w-44 text-sm">
              <SelectValue>
                {sortOptions.find((option) => option.value === sort)?.label ?? t('customSort')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sort === 'custom' && <SelectItem value="custom">{t('customSort')}</SelectItem>}
              {sortOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filter.conditions.length > 0 && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 px-0.5">
          <FilterChips value={filter} onChange={onFilter} fieldsConfig={fields} />
        </div>
      )}
    </div>
  )
}
