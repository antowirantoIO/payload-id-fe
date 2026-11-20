import { z } from 'zod'
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  tenant_id: z.string(),
  merchant_id: z.string().nullable().optional(),
})
export type Profile = z.infer<typeof userSchema>
export const profileSchema = z
  .object({
    id: z.string(),
    email: z.email(),
    name: z.string(),
    tenant: z.object({ id: z.string(), type: z.string() }),
    roles: z.array(z.object({ code: z.string() })),
    permissions: z.array(z.string()),
    merchant: z.object({ id: z.string() }).nullable().optional(),
  })
  .transform(({ tenant, merchant, ...user }) => ({
    ...user,
    tenant_id: tenant.id,
    tenant_type: tenant.type,
    merchant_id: merchant?.id,
  }))
export const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(256) })
export const loginResultSchema = z.object({
  user: userSchema,
  access_token: z.string().optional(),
  expires_in: z.number().optional(),
  requires_two_factor: z.boolean(),
})
