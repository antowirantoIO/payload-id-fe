import { z } from 'zod'
export const channelStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const
export const channelCategories = [
  'BANK_TRANSFER',
  'VIRTUAL_ACCOUNT',
  'QRIS',
  'EWALLET',
  'CARD',
] as const
export const channelDirections = ['PAYIN', 'PAYOUT', 'BOTH'] as const
export const channelSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category: z.enum(channelCategories),
  direction: z.enum(channelDirections),
  currency: z.string(),
  icon_url: z.string().url().nullable().optional(),
  status: z.enum(channelStatuses),
  deleted_at: z.iso.datetime().nullable().default(null),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  provider_code: z.string().nullable().optional(),
  provider_name: z.string().nullable().optional(),
})
export const channelListSchema = z.array(channelSchema)
export type Channel = z.infer<typeof channelSchema>
export type ChannelStatus = (typeof channelStatuses)[number]
