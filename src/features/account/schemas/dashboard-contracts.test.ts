import { expect, it } from 'vitest'
import { operationalDashboardMessages } from '@/messages/operational-dashboard'
import { alertsSchema, summarySchema } from './dashboard-contracts'

it('accepts real zero summaries but rejects missing or malformed metrics', () => {
  expect(
    summarySchema.parse({
      today_transactions: 0,
      today_payin_volume: 0,
      today_payout_volume: 0,
      month_transactions: 0,
    }).today_transactions,
  ).toBe(0)
  expect(summarySchema.safeParse({}).success).toBe(false)
  expect(summarySchema.safeParse({ today_transactions: '0' }).success).toBe(false)
})
it('handles backend empty alert collections and requires valid items', () => {
  expect(alertsSchema.parse({ alerts: null }).alerts).toEqual([])
  expect(alertsSchema.safeParse({ alerts: [{}] }).success).toBe(false)
})
it('provides dashboard copy in every supported locale', () => {
  for (const messages of Object.values(operationalDashboardMessages)) {
    expect(Object.keys(messages).sort()).toEqual(
      Object.keys(operationalDashboardMessages.en).sort(),
    )
  }
})
