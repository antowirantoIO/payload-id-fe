import { z } from 'zod'

export const transactionStatuses = [
  'CREATED',
  'PENDING',
  'PAID',
  'EXPIRED',
  'FAILED',
  'SETTLED',
  'REFUND_PENDING',
  'REFUNDED',
  'PARTIAL_REFUNDED',
  'REFUND_FAILED',
  'PROCESSING',
  'SUCCESS',
  'PENDING_APPROVAL',
] as const
const reference = z.object({ id: z.string(), code: z.string(), name: z.string() })
const decimal = z.string().regex(/^\d+(\.\d+)?$/)
// Matches Payment's TransactionResponse DTO. Decimal amounts stay strings at the boundary.
export const transactionSchema = z.object({
  id: z.string(),
  tenant: reference.extend({ type: z.string(), status: z.string() }).nullable(),
  merchant: reference.nullable(),
  issuer: reference.nullish(),
  channel: reference.extend({ category: z.string() }).nullish(),
  transaction_type: z.enum(['PAYIN', 'PAYOUT']),
  status: z.enum(transactionStatuses),
  external_id: z.string(),
  platform_reference_id: z.string(),
  channel_code: z.string().nullish(),
  amount: decimal,
  currency: z.string(),
  fee_amount: decimal,
  net_amount: decimal.nullish(),
  description: z.string().nullish(),
  customer_name: z.string().nullish(),
  customer_email: z.string().nullish(),
  payment_code: z.string().nullish(),
  payment_url: z.string().nullish(),
  settlement_status: z.enum(['UNSETTLED', 'SETTLED', 'PARTIAL_SETTLED']),
  expired_at: z.iso.datetime().nullish(),
  paid_at: z.iso.datetime().nullish(),
  failed_at: z.iso.datetime().nullish(),
  failure_code: z.string().nullish(),
  failure_message: z.string().nullish(),
  environment: z.enum(['SANDBOX', 'LIVE']),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})
export type Transaction = z.infer<typeof transactionSchema>
