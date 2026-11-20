import type { z } from 'zod'
import type { profileSchema } from '@/lib/api/contracts'
export type WorkspaceProfile = z.infer<typeof profileSchema>
export type Workspace = 'platform' | 'reseller' | 'merchant'
export function workspaceFor(profile: WorkspaceProfile): Workspace | undefined {
  if (profile.merchant_id) return 'merchant'
  if (profile.tenant_type === 'RESELLER') return 'reseller'
  if (profile.tenant_type === 'PLATFORM') return 'platform'
  return undefined
}

const permissions: Record<string, string[]> = {
  'iam/tenants': ['tenant.view'],
  'iam/merchants': ['merchant.view'],
  'iam/users': ['user.view'],
  'iam/roles': ['role.view'],
  'iam/credentials': ['credential.view'],
  'iam/keys': ['key.view'],
  'iam/security': ['security.view'],
  'iam/workflows': ['workflow.view'],
  'iam/audit': ['audit_log.view'],
  'iam/system': ['system.config.view', 'system.health.view'],
  'payment/transactions': ['transaction.read'],
  'payment/refunds': ['transaction.read'],
  'payment/payouts': ['payout.read'],
  'payment/batches': ['payout.read'],
  'payment/links': ['transaction.read'],
  'payment/dashboards': ['transaction.read', 'report.read'],
  'payment/sandbox': ['transaction.create'],
  'issuer/issuers': ['issuer.view'],
  'issuer/credentials': ['issuer_credential.view'],
  'issuer/channels': ['channel.view'],
  'issuer/mappings': ['issuer_channel.view'],
  'issuer/routing': ['merchant_issuer_channel.view'],
  'issuer/fees': ['fee.view'],
  'issuer/monitoring': ['health_log.view', 'request_log.view', 'circuit_breaker.view'],
  'accounting/fees': ['fee.read'],
  'accounting/wallets': ['wallet.read'],
  'accounting/balances': ['dashboard.read', 'wallet.read'],
  'accounting/settlements': ['settlement.read'],
  'accounting/schedules': ['settlement.read'],
  'accounting/withdrawals': ['wallet.read'],
  'accounting/ledger': ['report.read'],
  'accounting/reconciliation': ['recon.read'],
  'accounting/disputes': ['recon.read'],
  'accounting/reseller': ['settlement.read'],
  'accounting/reports': ['report.read'],
  'accounting/financial': ['report.read'],
  'accounting/exports': ['report.export'],
  'open/payments': ['transaction.read'],
  'open/disbursements': ['payout.read'],
  'open/links': ['transaction.read'],
  'open/utilities': ['wallet.read'],
  'open/webhooks': ['webhook.read'],
  'open/logs': ['api_log.read'],
  'open/callbacks': ['callback.read'],
}
const merchantModules = new Set([
  'payment/transactions',
  'payment/refunds',
  'payment/payouts',
  'payment/batches',
  'payment/links',
  'payment/sandbox',
  'accounting/wallets',
  'accounting/settlements',
  'accounting/withdrawals',
  'accounting/reports',
  'accounting/exports',
  'iam/users',
  'iam/credentials',
  'iam/keys',
  'iam/notifications',
  'open/webhooks',
  'open/callbacks',
  'open/logs',
  'open/payments',
  'open/disbursements',
  'open/links',
  'open/utilities',
])
const resellerModules = new Set([
  ...merchantModules,
  'iam/merchants',
  'iam/tenants',
  'iam/roles',
  'iam/workflows',
  'payment/dashboards',
  'accounting/fees',
  'accounting/balances',
  'accounting/reseller',
])
export function canViewModule(profile: WorkspaceProfile, service: string, module: string) {
  const workspace = workspaceFor(profile)
  const key = `${service}/${module}`
  if (!workspace) return false
  if (workspace === 'merchant' && !merchantModules.has(key)) return false
  if (workspace === 'reseller' && !resellerModules.has(key)) return false
  if (service === 'vault')
    return workspace === 'platform' && profile.roles.some((role) => role.code === 'SUPER_ADMIN')
  if (key === 'iam/notifications') return true
  return permissions[key]?.some((permission) => profile.permissions.includes(permission)) ?? false
}
