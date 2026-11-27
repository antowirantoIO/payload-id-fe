import { z } from 'zod'

export const payoutStatuses = [
  'CREATED',
  'PENDING_APPROVAL',
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'SETTLED',
] as const

export const payoutActions = ['approve', 'reject', 'retry', 'cancel'] as const

const decimal = z.string().regex(/^\d+(\.\d+)?$/)
const reference = z.object({ id: z.string(), code: z.string(), name: z.string() })

export const payoutDetailSchema = z.object({
  payout_method: z.string(),
  destination_bank_code: z.string().nullish(),
  destination_bank_name: z.string().nullish(),
  destination_account_number: z.string(),
  destination_account_name: z.string(),
  destination_account_verified: z.boolean(),
  transfer_channel: z.string().nullish(),
  source: z.string(),
})

export const payoutSchema = z.object({
  id: z.string(),
  tenant: reference.extend({ type: z.string(), status: z.string() }).nullable(),
  merchant: reference.nullable(),
  issuer: reference.nullish(),
  channel: reference.extend({ category: z.string() }).nullish(),
  channel_code: z.string().nullish(),
  transaction_type: z.literal('PAYOUT'),
  status: z.enum(payoutStatuses),
  external_id: z.string(),
  platform_reference_id: z.string(),
  amount: decimal,
  currency: z.string(),
  fee_amount: decimal,
  net_amount: decimal.nullish(),
  description: z.string().nullish(),
  payout_detail: payoutDetailSchema,
  settlement_status: z.enum(['UNSETTLED', 'SETTLED', 'PARTIAL_SETTLED']),
  failure_code: z.string().nullish(),
  failure_message: z.string().nullish(),
  environment: z.enum(['SANDBOX', 'LIVE']),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  paid_at: z.iso.datetime().nullish(),
  failed_at: z.iso.datetime().nullish(),
})

export const payoutListSchema = z.array(payoutSchema)
export type Payout = z.infer<typeof payoutSchema>
export type PayoutStatus = (typeof payoutStatuses)[number]
export type PayoutAction = (typeof payoutActions)[number]

export type PayoutFilters = {
  search?: string
  status?: PayoutStatus | ''
  environment?: Payout['environment'] | ''
  minimum?: string
  maximum?: string
  start?: string
  end?: string
}

export type PayoutScope = {
  tenantId?: string
  merchantId?: string
  environment?: Payout['environment']
}
