'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { FilterGroup } from '@/components/shared/data-table/filters'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function searchTerms(value: string) {
  return [
    ...new Set(
      value
        .split(/[,;\n]+/)
        .map((term) => term.trim())
        .filter(Boolean),
    ),
  ]
}

export function MultiSearch({
  search,
  onSearch,
  placeholder = 'ORDER-00001\nORDER-00002',
  applyLabel,
  description,
}: {
  search: string
  onSearch: (value: string) => void
  placeholder?: string
  applyLabel?: string
  description?: string
}) {
  const t = useTranslations('table')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const terms = searchTerms(draft)
  return (
    <>
      <Button
        variant="outline"
        className="h-10 shrink-0"
        onClick={() => {
          setDraft(searchTerms(search).join('\n'))
          setOpen(true)
        }}
      >
        {searchTerms(search).length > 1
          ? t('searchCount', { count: searchTerms(search).length })
          : t('multiSearch')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('multiSearch')}</DialogTitle>
            <DialogDescription>{description ?? t('multiSearchDescription')}</DialogDescription>
          </DialogHeader>
          <label htmlFor="multi-search-values" className="text-xs font-medium">
            {t('searchValues')}
          </label>
          <textarea
            id="multi-search-values"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            className="min-h-52 w-full resize-y rounded-md border bg-background p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-ring"
          />
          <p className="text-xs text-muted-foreground">
            {t('uniqueValues', { count: terms.length })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                onSearch(terms.join(', '))
                setOpen(false)
              }}
            >
              {applyLabel ?? t('applySearch')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function utcDay(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function PeriodFilter({
  filter,
  onFilter,
}: {
  filter: FilterGroup
  onFilter: (value: FilterGroup) => void
}) {
  const t = useTranslations('table')
  const condition = filter.conditions.find((item) => item.id === 'quick-period')
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [validation, setValidation] = useState(false)
  function preset(days: number, yesterday = false, month = false) {
    const now = new Date()
    const last = new Date(now)
    if (yesterday) last.setUTCDate(last.getUTCDate() - 1)
    const first = new Date(last)
    if (month) first.setUTCDate(1)
    else first.setUTCDate(first.getUTCDate() - days + 1)
    setStart(`${utcDay(first)}T00:00`)
    setEnd(`${utcDay(last)}T23:59:59`)
    setValidation(false)
  }
  const range = Array.isArray(condition?.value) ? condition.value : undefined
  const summary = range
    ? `${String(range[0]).replace('T', ' ')} – ${String(range[1]).replace('T', ' ')} UTC`
    : t('allDates')
  return (
    <>
      <Button
        variant="outline"
        className="h-9 max-w-full text-sm"
        title={summary}
        onClick={() => {
          setStart(range ? String(range[0]) : '')
          setEnd(range ? String(range[1]) : '')
          setValidation(false)
          setOpen(true)
        }}
      >
        <span className="truncate">
          {t('period')}: {summary}
        </span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('period')}</DialogTitle>
            <DialogDescription>{t('periodDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'today', action: () => preset(1) },
              { label: 'yesterday', action: () => preset(1, true) },
              { label: 'lastSeven', action: () => preset(7) },
              { label: 'thisMonth', action: () => preset(1, false, true) },
            ].map((item) => (
              <Button key={item.label} variant="outline" size="sm" onClick={item.action}>
                {t(item.label)}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="period-start" className="space-y-2 text-xs font-medium">
              <span>{t('startTime')}</span>
              <Input
                id="period-start"
                type="datetime-local"
                step="1"
                className="h-11"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </label>
            <label htmlFor="period-end" className="space-y-2 text-xs font-medium">
              <span>{t('endTime')}</span>
              <Input
                id="period-end"
                type="datetime-local"
                step="1"
                className="h-11"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </label>
          </div>
          {validation && (
            <p role="alert" className="text-sm text-destructive">
              {t('invalidPeriod')}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                onFilter({
                  ...filter,
                  conditions: filter.conditions.filter((item) => item.id !== 'quick-period'),
                })
                setOpen(false)
              }}
            >
              {t('clearPeriod')}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                if (!start || !end || start > end) {
                  setValidation(true)
                  return
                }
                onFilter({
                  ...filter,
                  conditions: [
                    ...filter.conditions.filter((item) => item.id !== 'quick-period'),
                    {
                      id: 'quick-period',
                      field: 'created_at',
                      operator: 'between',
                      value: [start, end],
                    },
                  ],
                })
                setOpen(false)
              }}
            >
              {t('applyFilters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
