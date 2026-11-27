import { expect, it } from 'vitest'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { merchantMessages } from '@/messages/merchants'
import { makeMerchants } from './model'
import { buildMerchantFields, buildMerchantSortOptions } from './table-config'

it('uses the shared filter evaluator for merchant AND/OR and quick filters', () => {
  const rows = makeMerchants()
  const result = applyTableFilter(rows, {
    combinator: 'or',
    conditions: [
      { id: 'quick-status', field: 'status', operator: 'in', value: ['ACTIVE'] },
      { id: 'a', field: 'code', operator: 'eq', value: 'DEMO-0005' },
      { id: 'b', field: 'city', operator: 'contains', value: 'Jakarta' },
    ],
  })
  expect(result.length).toBeGreaterThan(0)
  expect(
    result.every(
      (row) => row.status === 'ACTIVE' && (row.code === 'DEMO-0005' || row.city === 'Jakarta'),
    ),
  ).toBe(true)
  expect(
    buildMerchantFields((key) => key).find((field) => field.id === 'created_at'),
  ).toMatchObject({
    type: 'date',
    includeTime: true,
  })
})

it('localizes labels without changing environment, status or sort identifiers', () => {
  const fields = buildMerchantFields((key) => `localized:${key}`)
  const environment = fields.find((field) => field.id === 'environment')
  const status = fields.find((field) => field.id === 'status')
  expect(environment?.type === 'enum' ? environment.options : undefined).toEqual([
    { value: 'sandbox', label: 'localized:environments.sandbox' },
    { value: 'production', label: 'localized:environments.production' },
  ])
  expect(status?.type === 'enum' ? status.options[0] : undefined).toEqual({
    value: 'DRAFT',
    label: 'localized:statuses.DRAFT',
  })
  expect(buildMerchantSortOptions((key) => `localized:${key}`)[0]).toEqual({
    value: 'newest',
    label: 'localized:sort.newest',
  })
})

it('ships matching merchant message keys for all supported locales', () => {
  const keys = (value: object): string[] =>
    Object.entries(value)
      .flatMap(([key, child]) =>
        typeof child === 'object' ? keys(child).map((nested) => `${key}.${nested}`) : [key],
      )
      .sort()
  expect(keys(merchantMessages.id)).toEqual(keys(merchantMessages.en))
  expect(merchantMessages.en.fields.code).toBe('Merchant code')
  expect(merchantMessages.en.statuses.PENDING_KYC).toBe('PENDING KYC')
})
