import {
  canViewModule,
  type Workspace,
  type WorkspaceProfile,
  workspaceFor,
} from '@/lib/auth/workspace'
import { findModule } from './navigation'
import type { Capability } from './product-paths'
import { productPath } from './product-paths'

export type Feature = {
  slug: string
  label: string
  group: string
  workspaces: readonly Workspace[]
  modules: readonly Capability[]
}
const all = ['platform', 'reseller', 'merchant'] as const
const platform = ['platform'] as const

export const features: readonly Feature[] = [
  {
    slug: 'payments',
    label: 'featurePayments',
    group: 'operationsGroup',
    workspaces: all,
    modules: ['payment/transactions', 'payment/refunds', 'open/payments'],
  },
  {
    slug: 'payouts',
    label: 'featurePayouts',
    group: 'operationsGroup',
    workspaces: all,
    modules: ['payment/payouts', 'payment/batches', 'open/disbursements'],
  },
  {
    slug: 'payment-links',
    label: 'featureLinks',
    group: 'operationsGroup',
    workspaces: all,
    modules: ['payment/links', 'open/links'],
  },
  {
    slug: 'approvals',
    label: 'featureApprovals',
    group: 'operationsGroup',
    workspaces: platform,
    modules: ['iam/workflows'],
  },
  {
    slug: 'merchants',
    label: 'featureMerchants',
    group: 'businessGroup',
    workspaces: ['platform', 'reseller'],
    modules: ['iam/merchants', 'payment/dashboards'],
  },
  {
    slug: 'resellers',
    label: 'featureResellers',
    group: 'businessGroup',
    workspaces: platform,
    modules: ['iam/tenants'],
  },
  {
    slug: 'partners',
    label: 'featurePartners',
    group: 'businessGroup',
    workspaces: platform,
    modules: [
      'issuer/issuers',
      'issuer/channels',
      'issuer/mappings',
      'issuer/routing',
      'issuer/credentials',
    ],
  },
  {
    slug: 'balances',
    label: 'featureBalances',
    group: 'financeGroup',
    workspaces: all,
    modules: [
      'accounting/wallets',
      'accounting/balances',
      'accounting/ledger',
      'accounting/withdrawals',
    ],
  },
  {
    slug: 'settlements',
    label: 'featureSettlements',
    group: 'financeGroup',
    workspaces: all,
    modules: ['accounting/settlements', 'accounting/schedules', 'accounting/reseller'],
  },
  {
    slug: 'reconciliation',
    label: 'featureReconciliation',
    group: 'financeGroup',
    workspaces: platform,
    modules: ['accounting/reconciliation', 'accounting/disputes'],
  },
  {
    slug: 'pricing',
    label: 'featurePricing',
    group: 'financeGroup',
    workspaces: ['platform', 'reseller'],
    modules: ['accounting/fees', 'issuer/fees'],
  },
  {
    slug: 'reports',
    label: 'featureReports',
    group: 'financeGroup',
    workspaces: all,
    modules: ['accounting/reports', 'accounting/financial', 'accounting/exports'],
  },
  {
    slug: 'business-profile',
    label: 'featureBusinessProfile',
    group: 'administrationGroup',
    workspaces: ['merchant', 'reseller'],
    modules: [],
  },
  {
    slug: 'integrations',
    label: 'featureIntegrations',
    group: 'administrationGroup',
    workspaces: all,
    modules: [
      'iam/credentials',
      'iam/keys',
      'open/webhooks',
      'open/callbacks',
      'open/logs',
      'open/utilities',
      'payment/sandbox',
    ],
  },
  {
    slug: 'access',
    label: 'featureAccess',
    group: 'administrationGroup',
    workspaces: all,
    modules: ['iam/users', 'iam/roles', 'iam/security'],
  },
  {
    slug: 'audit',
    label: 'featureAudit',
    group: 'administrationGroup',
    workspaces: platform,
    modules: ['iam/audit'],
  },
  {
    slug: 'platform-settings',
    label: 'featureSettings',
    group: 'administrationGroup',
    workspaces: platform,
    modules: ['iam/system', 'iam/notifications', 'issuer/monitoring'],
  },
]

export function visibleFeatureModules(profile: WorkspaceProfile, feature: Feature) {
  return feature.modules.filter((path) => {
    const [service, module] = path.split('/')
    return canViewModule(profile, service, module)
  })
}

export function canViewFeature(profile: WorkspaceProfile, feature: Feature) {
  const workspace = workspaceFor(profile)
  if (!workspace || !feature.workspaces.includes(workspace)) return false
  return feature.slug === 'business-profile' || visibleFeatureModules(profile, feature).length > 0
}

// Only distinct work areas deserve sidebar children; technical contracts stay on the feature page.
const sidebarSubfeatures: Record<string, readonly string[]> = {
  payments: ['payment/transactions', 'payment/refunds'],
  payouts: ['payment/payouts', 'payment/batches'],
  partners: ['issuer/issuers', 'issuer/channels', 'issuer/routing'],
  balances: ['accounting/wallets', 'accounting/ledger', 'accounting/withdrawals'],
  settlements: ['accounting/settlements', 'accounting/schedules', 'accounting/reseller'],
  reconciliation: ['accounting/reconciliation', 'accounting/disputes'],
  integrations: ['iam/credentials', 'open/webhooks', 'open/logs', 'payment/sandbox'],
  access: ['iam/users', 'iam/roles', 'iam/security'],
}

export function featureNavigation(profile: WorkspaceProfile | undefined) {
  if (!profile || !workspaceFor(profile)) return []
  const groups =
    workspaceFor(profile) === 'reseller'
      ? ['businessGroup', 'operationsGroup', 'financeGroup', 'administrationGroup']
      : ['operationsGroup', 'businessGroup', 'financeGroup', 'administrationGroup']
  return [
    {
      label: 'overview',
      items: [
        {
          href: '/dashboard',
          label: 'dashboard',
          key: 'dashboard',
          children: [] as { href: string; label: string }[],
        },
      ],
    },
    ...groups
      .map((label) => ({
        label,
        items: features
          .filter((feature) => feature.group === label && canViewFeature(profile, feature))
          .map((feature) => {
            const children = contractsForFeature(profile, feature)
              .filter((contract) => sidebarSubfeatures[feature.slug]?.includes(contract.path))
              .map((contract) => ({ href: productPath(contract.path), label: contract.label }))
            return {
              href: `/${feature.slug}`,
              label: feature.label,
              key: feature.slug,
              children: children.length > 1 ? children : [],
            }
          }),
      }))
      .filter((group) => group.items.length > 0),
  ]
}

export function featureForModule(service: string, module: string) {
  const capability = `${service}/${module}`
  return features.find((feature) => feature.modules.some((path) => path === capability))
}

export function contractsForFeature(profile: WorkspaceProfile, feature: Feature) {
  return visibleFeatureModules(profile, feature).flatMap((path) => {
    const [service, module] = path.split('/')
    const entry = findModule(service, module)
    return entry ? [{ path, ...entry.feature }] : []
  })
}
