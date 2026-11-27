import { z } from 'zod'

export const issuerStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED'] as const
export const healthStatuses = ['HEALTHY', 'DEGRADED', 'DOWN', 'UNTESTED'] as const
const url = z.string().url()
export const providerSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  base_url: url,
  base_url_sandbox: url.nullable().optional(),
  status: z.enum(issuerStatuses),
  health_status: z.enum(healthStatuses),
  health_checked_at: z.iso.datetime().nullable().optional(),
  supported_currencies: z.array(z.string()),
  metadata: z.record(z.string(), z.string()).default({}),
  channel_count: z.number().int().nonnegative(),
  channels: z.array(
    z.object({ id: z.string(), code: z.string(), name: z.string(), category: z.string() }),
  ),
  credential_keys: z.array(z.string()),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})
export const providerListSchema = z.array(providerSchema)
export type Provider = z.infer<typeof providerSchema>
export type ProviderStatus = (typeof issuerStatuses)[number]
export type ProviderHealthStatus = (typeof healthStatuses)[number]
