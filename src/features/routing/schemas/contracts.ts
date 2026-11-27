import { z } from 'zod'

const amount = z.string().regex(/^\d+(\.\d+)?$/)
export function compareRoutingAmounts(left: string, right: string) {
  const [a, fractionA = ''] = left.split('.')
  const [b, fractionB = ''] = right.split('.')
  const wholeA = a.replace(/^0+(?=\d)/, '')
  const wholeB = b.replace(/^0+(?=\d)/, '')
  if (wholeA.length !== wholeB.length) return wholeA.length - wholeB.length
  const whole = wholeA.localeCompare(wholeB)
  return (
    whole ||
    fractionA
      .padEnd(Math.max(fractionA.length, fractionB.length), '0')
      .localeCompare(fractionB.padEnd(Math.max(fractionA.length, fractionB.length), '0'))
  )
}
export const routingStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
const fields = {
  provider_code: z.string().trim().min(1),
  provider_name: z.string().trim().min(1),
  channel_code: z.string().trim().min(1),
  channel_name: z.string().trim().min(1),
  merchant_scope: z.string().trim().min(1),
  issuer_channel_code: z.string().trim().min(1),
  status: routingStatusSchema,
  min_amount: amount.optional(),
  max_amount: amount.optional(),
  default_expiry_minutes: z
    .string()
    .regex(/^\d+$/)
    .refine((value) => /[1-9]/.test(value))
    .optional(),
}
export const routingInputSchema = z
  .object(fields)
  .refine(
    (value) =>
      !value.min_amount ||
      !value.max_amount ||
      compareRoutingAmounts(value.min_amount, value.max_amount) <= 0,
    { message: 'invalidRange', path: ['max_amount'] },
  )
export const routingRecordSchema = z.object({
  ...fields,
  id: z.string().min(1),
  created: z.iso.datetime(),
  updated: z.iso.datetime(),
})
export type RoutingRecord = z.infer<typeof routingRecordSchema>
export type RoutingInput = z.infer<typeof routingInputSchema>
export type RoutingStatus = z.infer<typeof routingStatusSchema>
