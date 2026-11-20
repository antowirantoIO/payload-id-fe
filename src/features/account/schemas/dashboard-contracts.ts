import { z } from 'zod'
export const summarySchema = z.object({
  today_transactions: z.number(),
  today_payin_volume: z.number(),
  today_payout_volume: z.number(),
  month_transactions: z.number(),
})
export const alertsSchema = z.object({
  alerts: z
    .array(
      z.object({
        title: z.string(),
        message: z.string(),
        severity: z.string(),
        created_at: z.string(),
      }),
    )
    .nullable()
    .transform((value) => value ?? []),
})
