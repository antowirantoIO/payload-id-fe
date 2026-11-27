import { z } from 'zod'

/**
 * Wire contracts for the IAM merchant API (`/api/v1/merchants`).
 * These mirror `services/iam/internal/handler/http/dto/response/merchant.go`.
 */

export const merchantStatuses = [
  'DRAFT',
  'PENDING_KYC',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
  'TERMINATED',
] as const

export const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const
export const businessTypes = ['PT', 'CV', 'UD', 'INDIVIDUAL', 'YAYASAN'] as const
export const settlementModes = ['BANK', 'WALLET'] as const
export const settlementSchedules = ['H+1', 'H+2', 'H+3', 'MANUAL'] as const

const reference = z.object({ id: z.string(), code: z.string(), name: z.string() })

export const tenantSummarySchema = reference.extend({
  type: z.string(),
  status: z.string(),
})

const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export const merchantSchema = z.object({
  id: z.string(),
  tenant: tenantSummarySchema.nullable(),
  code: z.string(),
  name: z.string(),
  legal_name: z.string().nullish(),
  business_type: z.enum(businessTypes),
  business_category: z.string(),
  status: z.enum(merchantStatuses),
  tier: z.enum(tiers),
  address: z.string().nullish(),
  city: z.string().nullish(),
  province: z.string().nullish(),
  postal_code: z.string().nullish(),
  npwp: z.string().nullish(),
  nib: z.string().nullish(),
  website: z.string().nullish(),
  settlement_mode: z.enum(settlementModes),
  settlement_schedule: z.string(),
  callback_url: z.string().nullish(),
  callback_url_sandbox: z.string().nullish(),
  ip_whitelist: z.array(z.string()).nullish(),
  is_sandbox: z.boolean(),
  status_reason: z.string().nullish(),
  activated_at: z.string().nullish(),
  approved_at: z.string().nullish(),
  approved_by: userSummarySchema.nullish(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: userSummarySchema.nullish(),
})

export const merchantListSchema = z.object({
  items: z.array(merchantSchema),
  pagination: z.object({
    current_page: z.number(),
    per_page: z.number(),
    total_items: z.number(),
    total_pages: z.number(),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
})

export const auditEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  service: z.string(),
  old_values: z.record(z.string(), z.unknown()).nullish(),
  new_values: z.record(z.string(), z.unknown()).nullish(),
  user: userSummarySchema.nullish(),
  created_at: z.string(),
})

export const auditListSchema = z.array(auditEntrySchema)

export const tenantOptionSchema = reference.extend({
  type: z.string(),
  status: z.string(),
})

export const tenantOptionsSchema = z.array(tenantOptionSchema)

export type MerchantRecord = z.infer<typeof merchantSchema>
export type MerchantStatus = (typeof merchantStatuses)[number]
export type MerchantTier = (typeof tiers)[number]
export type MerchantTenant = z.infer<typeof tenantSummarySchema>
export type TenantOption = z.infer<typeof tenantOptionSchema>
export type AuditEntry = z.infer<typeof auditEntrySchema>
export type MerchantList = z.infer<typeof merchantListSchema>

export type MerchantListQuery = {
  page?: number
  per_page?: number
  status?: string
  tier?: string
  search?: string
  tenant_id?: string
  business_category?: string
}

export type MerchantWriteInput = {
  tenant_id?: string
  code?: string
  name: string
  legal_name?: string | null
  business_type: string
  business_category: string
  tier?: string
  address?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  npwp?: string | null
  nib?: string | null
  website?: string | null
  settlement_mode?: string
  settlement_schedule?: string
  callback_url?: string | null
  callback_url_sandbox?: string | null
  ip_whitelist?: string[]
  is_sandbox?: boolean
}

/** Statuses reachable from each state, mirroring the IAM state machine. */
export const merchantTransitions: Record<MerchantStatus, MerchantStatus[]> = {
  DRAFT: ['PENDING_KYC'],
  PENDING_KYC: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['ACTIVE'],
  ACTIVE: ['SUSPENDED', 'TERMINATED'],
  SUSPENDED: ['ACTIVE', 'TERMINATED'],
  REJECTED: [],
  TERMINATED: [],
}
