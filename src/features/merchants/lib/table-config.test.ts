import { expect, it } from 'vitest'
import { applyTableFilter } from '@/components/shared/data-table/lib/apply-filter'
import { makeMerchants } from './model'
import { merchantFields } from './table-config'

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
  expect(merchantFields.find((field) => field.id === 'created_at')).toMatchObject({
    type: 'date',
    includeTime: true,
  })
})
