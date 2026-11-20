import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  CreditCardIcon,
  GlobeIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  ServerIcon,
} from 'lucide-react'

export type ModuleDefinition = { slug: string; label: string; endpoints: string[] }
export type ServiceNavigation = {
  slug: string
  label: string
  icon: LucideIcon
  modules: ModuleDefinition[]
}
export const serviceNavigation: ServiceNavigation[] = [
  {
    slug: 'iam',
    label: 'IAM',
    icon: Building2Icon,
    modules: [
      {
        slug: 'tenants',
        label: 'tenants',
        endpoints: [
          '/tenants',
          '/tenants/{id}/configurations',
          '/tenants/{id}/branding',
          '/tenants/{id}/custom-domain',
          '/tenants/{id}/channel-access',
        ],
      },
      {
        slug: 'merchants',
        label: 'merchants',
        endpoints: [
          '/merchants',
          '/merchants/growth-report',
          '/merchants/{id}/documents',
          '/merchants/{id}/contacts',
          '/merchants/{id}/bank-accounts',
          '/merchants/{id}/channels',
          '/merchants/{id}/sandbox-mode',
          '/merchants/{id}/team',
        ],
      },
      {
        slug: 'users',
        label: 'users',
        endpoints: [
          '/users',
          '/users/{id}/roles',
          '/users/{id}/force-logout',
          '/users/{id}/login-history',
        ],
      },
      {
        slug: 'roles',
        label: 'roles',
        endpoints: ['/roles', '/permissions', '/roles/{id}/permissions'],
      },
      {
        slug: 'credentials',
        label: 'credentials',
        endpoints: [
          '/merchants/{id}/credentials',
          '/merchants/{id}/credentials/{credId}/regenerate',
          '/merchants/{id}/credentials/{credId}/usage',
        ],
      },
      {
        slug: 'keys',
        label: 'keys',
        endpoints: ['/merchants/{id}/keys', '/platform/keys', '/platform/keys/{keyId}/rotate'],
      },
      {
        slug: 'security',
        label: 'security',
        endpoints: [
          '/security/events',
          '/security/ip-blacklist',
          '/auth/change-password',
          '/auth/2fa/enable',
          '/auth/sessions',
          '/auth/logout-all',
        ],
      },
      {
        slug: 'workflows',
        label: 'workflows',
        endpoints: [
          '/workflows',
          '/workflows/pending',
          '/workflows/history',
          '/workflows/{id}/approve',
          '/workflows/{id}/reject',
        ],
      },
      {
        slug: 'notifications',
        label: 'notifications',
        endpoints: ['/notifications', '/notifications/preferences', '/notifications/read-all'],
      },
      { slug: 'audit', label: 'audit', endpoints: ['/audit-logs'] },
      {
        slug: 'system',
        label: 'system',
        endpoints: [
          '/system/config',
          '/system/health',
          '/system/health/database',
          '/system/health/redis',
          '/system/health/rabbitmq',
          '/upload',
        ],
      },
    ],
  },
  {
    slug: 'payment',
    label: 'Payment',
    icon: CreditCardIcon,
    modules: [
      {
        slug: 'transactions',
        label: 'transactions',
        endpoints: [
          '/transactions',
          '/transactions/stats',
          '/transactions/chart',
          '/transactions/search',
          '/transactions/{id}/history',
          '/transactions/{id}/fee-breakdown',
          '/transactions/{id}/void',
          '/transactions/{id}/force-status',
          '/transactions/{id}/flag',
        ],
      },
      {
        slug: 'payouts',
        label: 'payouts',
        endpoints: [
          '/payouts',
          '/payouts/create',
          '/payouts/account-inquiry',
          '/payouts/{id}/approve',
          '/payouts/{id}/retry',
          '/payouts/{id}/cancel',
        ],
      },
      {
        slug: 'batches',
        label: 'batches',
        endpoints: [
          '/payout-batches',
          '/payout-batches/{batchId}/items',
          '/payouts/batch',
          '/payouts/batch-template',
        ],
      },
      {
        slug: 'refunds',
        label: 'refunds',
        endpoints: [
          '/refunds',
          '/refunds/{id}/approve',
          '/refunds/{id}/reject',
          '/refunds/{id}/process',
        ],
      },
      { slug: 'links', label: 'links', endpoints: ['/payment-links'] },
      {
        slug: 'dashboards',
        label: 'dashboards',
        endpoints: [
          '/dashboard/alerts',
          '/reseller/dashboard/summary',
          '/reseller/dashboard/transaction-chart',
          '/reseller/dashboard/merchant-summary',
          '/merchant/dashboard/summary',
        ],
      },
      {
        slug: 'sandbox',
        label: 'sandbox',
        endpoints: ['/transactions/sandbox/simulate-payment', '/transactions/{id}/force-expire'],
      },
    ],
  },
  {
    slug: 'issuer',
    label: 'Issuer',
    icon: ServerIcon,
    modules: [
      {
        slug: 'issuers',
        label: 'issuers',
        endpoints: ['/issuers', '/issuers/{id}/detail', '/issuers/{id}/test-connection'],
      },
      {
        slug: 'credentials',
        label: 'credentials',
        endpoints: ['/issuers/{issuer_id}/credentials'],
      },
      { slug: 'channels', label: 'channels', endpoints: ['/channels'] },
      { slug: 'mappings', label: 'mappings', endpoints: ['/issuer-channels'] },
      { slug: 'routing', label: 'routing', endpoints: ['/merchant-issuer-channels'] },
      { slug: 'fees', label: 'fees', endpoints: ['/fees'] },
      {
        slug: 'monitoring',
        label: 'monitoring',
        endpoints: [
          '/health-logs',
          '/request-logs',
          '/request-logs/performance',
          '/circuit-breakers',
          '/circuit-breakers/{id}/reset',
        ],
      },
    ],
  },
  {
    slug: 'accounting',
    label: 'Accounting',
    icon: LandmarkIcon,
    modules: [
      {
        slug: 'fees',
        label: 'feeRules',
        endpoints: [
          '/fee-rules',
          '/fee-rules/simulate',
          '/fee-rules/bulk',
          '/fee-rules/{id}/tiers',
          '/fee-rules/{id}/clone',
          '/fee-rules/{id}/history',
          '/tenant-fee-markups',
        ],
      },
      {
        slug: 'wallets',
        label: 'wallets',
        endpoints: [
          '/wallets',
          '/wallets/all',
          '/wallets/mutations',
          '/wallets/freeze',
          '/wallets/unfreeze',
          '/wallets/adjust',
          '/wallets/sandbox-reset',
        ],
      },
      {
        slug: 'settlements',
        label: 'settlements',
        endpoints: [
          '/settlements',
          '/settlements/dashboard',
          '/settlements/trigger',
          '/settlements/{id}/items',
          '/settlements/{id}/approve',
          '/settlements/{id}/retry',
        ],
      },
      { slug: 'schedules', label: 'schedules', endpoints: ['/settlement-schedules'] },
      {
        slug: 'withdrawals',
        label: 'withdrawals',
        endpoints: [
          '/withdrawals',
          '/withdrawals/{id}/approve',
          '/withdrawals/{id}/reject',
          '/withdrawals/{id}/process',
          '/withdrawals/{id}/retry',
        ],
      },
      {
        slug: 'ledger',
        label: 'ledger',
        endpoints: [
          '/ledger/accounts',
          '/ledger/entries',
          '/ledger/balance-sheet',
          '/ledger/revenue-chart',
          '/ledger/issuer-settlement',
          '/ledger/issuer-fee-payment',
        ],
      },
      {
        slug: 'reconciliation',
        label: 'reconciliation',
        endpoints: [
          '/recon/dashboard',
          '/recon/import/preview',
          '/recon/import',
          '/recon/trigger',
          '/recon/config/auto-resolve',
          '/recon/batches',
        ],
      },
      {
        slug: 'disputes',
        label: 'disputes',
        endpoints: [
          '/recon/disputes',
          '/recon/disputes/aging',
          '/recon/disputes/{id}/investigate',
          '/recon/disputes/{id}/resolve',
          '/recon/disputes/{id}/escalate',
          '/recon/disputes/{id}/assign',
          '/recon/disputes/{id}/notes',
        ],
      },
      {
        slug: 'reseller',
        label: 'reseller',
        endpoints: [
          '/reseller-settlements',
          '/reseller-settlements/revenue-report',
          '/reseller-settlements/revenue-chart',
        ],
      },
      {
        slug: 'reports',
        label: 'reports',
        endpoints: [
          '/reports/revenue',
          '/reports/fees',
          '/reports/refunds',
          '/reports/custom',
          '/reports/export',
          '/reports/schedules',
        ],
      },
      {
        slug: 'financial',
        label: 'financial',
        endpoints: [
          '/financial-reports/tpv',
          '/financial-reports/gross-revenue',
          '/financial-reports/cost-of-revenue',
          '/financial-reports/net-revenue',
          '/financial-reports/outstanding',
          '/financial-reports/cash-position',
          '/financial-reports/cash-coverage',
          '/financial-reports/revenue-per-channel',
          '/financial-reports/expense-per-issuer',
          '/financial-reports/profit-per-channel',
        ],
      },
      {
        slug: 'balances',
        label: 'balances',
        endpoints: [
          '/dashboard/tenant/balance',
          '/dashboard/tenant/sub-tenants',
          '/dashboard/tenant/margin',
          '/dashboard/tenant/merchants/{id}',
          '/dashboard/platform/pool',
        ],
      },
      { slug: 'exports', label: 'exports', endpoints: ['/export-jobs', '/export-jobs/stream'] },
    ],
  },
  {
    slug: 'open',
    label: 'Open API',
    icon: GlobeIcon,
    modules: [
      {
        slug: 'payments',
        label: 'merchantPayments',
        endpoints: [
          '/v1/payments',
          '/v1/payments/external/{external_id}',
          '/v1/payments/{id}/cancel',
          '/v1/payments/{id}/refund',
          '/v1/refunds/{id}',
        ],
      },
      {
        slug: 'disbursements',
        label: 'disbursements',
        endpoints: ['/v1/disbursements', '/v1/disbursements/validate', '/v1/disbursements/batch'],
      },
      {
        slug: 'links',
        label: 'links',
        endpoints: ['/v1/payment-links', '/v1/payment-links/{id}/deactivate'],
      },
      {
        slug: 'utilities',
        label: 'utilities',
        endpoints: ['/v1/balance', '/v1/channels', '/v1/banks'],
      },
      {
        slug: 'webhooks',
        label: 'webhooks',
        endpoints: ['/api/v1/webhook-configs', '/api/v1/webhook-configs/merchants/{merchantId}'],
      },
      { slug: 'logs', label: 'apiLogs', endpoints: ['/api/v1/api-logs'] },
      {
        slug: 'callbacks',
        label: 'callbacks',
        endpoints: [
          '/api/v1/callback-logs',
          '/api/v1/callback-logs/test',
          '/api/v1/callback-logs/{id}/retry',
        ],
      },
    ],
  },
  {
    slug: 'vault',
    label: 'Vault',
    icon: LockKeyholeIcon,
    modules: [
      {
        slug: 'keys',
        label: 'vaultKeys',
        endpoints: ['CreateKey', 'RotateKey', 'GetKeyInfo', 'ListKeys', 'RetireKey'],
      },
      {
        slug: 'crypto',
        label: 'crypto',
        endpoints: [
          'Encrypt',
          'Decrypt',
          'BatchEncrypt',
          'BatchDecrypt',
          'Sign',
          'Verify',
          'GenerateHMAC',
          'VerifyHMAC',
          'Hash',
          'GenerateRandom',
        ],
      },
      { slug: 'seal', label: 'seal', endpoints: ['GetSealStatus'] },
    ],
  },
]
export const dashboardIcon = LayoutDashboardIcon
export function findModule(service: string, module: string) {
  const group = serviceNavigation.find((item) => item.slug === service)
  const feature = group?.modules.find((item) => item.slug === module)
  return group && feature ? { group, feature } : undefined
}
