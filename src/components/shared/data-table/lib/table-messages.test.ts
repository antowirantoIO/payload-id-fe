import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import { tableMessages } from '@/messages/table'
import { OPERATORS_BY_TYPE } from '../filters/lib/types'

function leafKeys(value: object, prefix = ''): string[] {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return typeof child === 'object' && child !== null ? leafKeys(child, path) : [path]
    })
    .sort()
}

describe('table messages', () => {
  it.each(['id'] as const)('has recursive English key parity for %s', (locale) => {
    expect(leafKeys(tableMessages[locale])).toEqual(leafKeys(tableMessages.en))
  })

  it.each(['en', 'id'] as const)('translates every supported operator for %s', (locale) => {
    const t = createTranslator({ locale, messages: tableMessages[locale] })
    for (const operator of new Set(Object.values(OPERATORS_BY_TYPE).flat())) {
      expect(t(`operators.${operator}`)).not.toBe(`operators.${operator}`)
    }
    expect(t('selectedRows', { count: 2 })).toContain('2')
    expect(t('durationDays', { count: 1 })).toContain('1')
  })

  it('preserves existing English accessible names', () => {
    const t = createTranslator({ locale: 'en', messages: tableMessages.en })
    expect(t('navigation')).toBe('Transaction pagination')
    expect(t('search')).toBe('Search transactions')
    expect(t('sort')).toBe('Sort transactions')
    expect(t('rangeStart', { field: 'Created', timezone: ' (UTC)' })).toBe('Created start (UTC)')
    for (const [key, name] of Object.entries({
      firstPage: 'First page',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      lastPage: 'Last page',
      clearSelection: 'Clear selection',
      resizeColumn: 'Resize column',
      filterField: 'Filter field',
      filterOperator: 'Filter operator',
      removeCondition: 'Remove condition',
      removeFilter: 'Remove filter',
    })) {
      expect(t(key as keyof Omit<typeof tableMessages.en, 'operators'>)).toBe(name)
    }
  })
})
