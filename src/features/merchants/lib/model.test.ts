import { describe, expect, it } from 'vitest'
import {
  canTransition,
  exportMerchants,
  filterMerchants,
  makeMerchants,
  transitions,
} from './model'

describe('merchant demo model', () => {
  it('provides unique records and all lifecycle states', () => {
    const rows = makeMerchants()
    expect(new Set(rows.map((row) => row.code)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.status)).size).toBe(8)
  })
  it('matches any search term and narrows by filters', () => {
    const rows = makeMerchants()
    expect(filterMerchants(rows, 'DEMO-0001;DEMO-0002', '', '', '', '')).toHaveLength(2)
    expect(
      filterMerchants(rows, '', 'ACTIVE', 'BRONZE', '', 'production').every(
        (row) => row.status === 'ACTIVE' && row.tier === 'BRONZE' && !row.is_sandbox,
      ),
    ).toBe(true)
    expect(filterMerchants(rows, 'does not exist', '', '', '', '')).toHaveLength(0)
  })
  it('enforces eligibility for every selected merchant and terminal states', () => {
    const rows = makeMerchants()
    const active = rows.filter((row) => row.status === 'ACTIVE')
    expect(canTransition(active, 'SUSPENDED')).toBe(true)
    expect(canTransition([active[0], rows[0]], 'SUSPENDED')).toBe(false)
    expect(canTransition([], 'ACTIVE')).toBe(false)
    expect(transitions.REJECTED).toEqual([])
    expect(transitions.TERMINATED).toEqual([])
  })
  it('exports separate fields and escapes CSV formulas and quotes', () => {
    const row = { ...makeMerchants()[0], name: '=SUM(1,2)', legal_name: 'Demo "quoted"' }
    const csv = exportMerchants([row])
    expect(csv).toContain('"\'=SUM(1,2)"')
    expect(csv).toContain('"Demo ""quoted"""')
  })
})
