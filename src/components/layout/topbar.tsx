'use client'

import { useQuery } from '@tanstack/react-query'
import { MenuIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LocaleSwitcher } from '@/components/shared/locale-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { profileOptions } from '@/features/account/client'
import { usePathname } from '@/i18n/navigation'
import { workspaceFor } from '@/lib/auth/workspace'
import { features } from './features'
import { serviceNavigation } from './navigation'
import { productPaths } from './product-paths'
import { MobileSidebar } from './sidebar'
import { UserMenu } from './user-menu'

/**
 * Path-aware page title resolver.
 * Maps pathname → { crumb, title } for topbar display.
 * Uses longest-prefix match (e.g. /users/[id] → "Users").
 */
const ROUTE_META: Record<string, { title: string; crumb?: string }> = {
  '/dashboard': { title: 'dashboard', crumb: 'overview' },
  '/reports': { title: 'reports', crumb: 'overview' },
  '/users': { title: 'users', crumb: 'management' },
  '/roles': { title: 'rolesPermissions', crumb: 'management' },
  '/contacts': { title: 'contacts', crumb: 'management' },
  '/companies': { title: 'companies', crumb: 'management' },
  '/deals': { title: 'deals', crumb: 'management' },
  '/activities': { title: 'activities', crumb: 'management' },
  '/catalogue': { title: 'catalogue', crumb: 'operations' },
  '/catalogue/products': { title: 'productBrowser', crumb: 'catalogue' },
  '/quotations': { title: 'quotations', crumb: 'operations' },
  '/orders': { title: 'orders', crumb: 'operations' },
  '/shipments': { title: 'shipments', crumb: 'operations' },
  '/invoices': { title: 'invoices', crumb: 'operations' },
  '/documents': { title: 'documents', crumb: 'operations' },
  '/kyc': { title: 'kycReview', crumb: 'operations' },
  '/master/seaports': { title: 'seaports', crumb: 'masterData' },
  '/master/shipment-statuses': { title: 'shipmentStatuses', crumb: 'masterData' },
  '/master/currencies': { title: 'currencies', crumb: 'masterData' },
  '/master/incoterms': { title: 'incoterms', crumb: 'masterData' },
  '/master/commodities': { title: 'commoditiesHsCode', crumb: 'masterData' },
  '/master/uoms': { title: 'unitsOfMeasure', crumb: 'masterData' },
  '/master/container-types': { title: 'containerTypes', crumb: 'masterData' },
  '/master/document-types': { title: 'documentTypes', crumb: 'masterData' },
  '/master/payment-methods': { title: 'paymentMethods', crumb: 'masterData' },
  '/isma/cases': { title: 'cases', crumb: 'isma' },
  '/isma/feedback': { title: 'feedback', crumb: 'isma' },
  '/isma/surveys': { title: 'surveys', crumb: 'isma' },
  '/notifications': { title: 'notifications', crumb: 'system' },
  '/audit-log': { title: 'auditLog', crumb: 'system' },
  '/settings': { title: 'settings', crumb: 'system' },
  '/settings/profile': { title: 'profile', crumb: 'settings' },
  '/settings/account': { title: 'account', crumb: 'settings' },
  '/settings/security': { title: 'security', crumb: 'settings' },
  '/settings/appearance': { title: 'appearance', crumb: 'settings' },
  '/settings/notifications': { title: 'notifications', crumb: 'settings' },
  '/settings/danger-zone': { title: 'dangerZone', crumb: 'settings' },
}

const BUYER_ROUTE_META: Record<string, { title: string }> = {
  '/buyer/dashboard': { title: 'dashboard' },
  '/buyer/rfq': { title: 'myRfqs' },
  '/buyer/quotations': { title: 'incomingOffers' },
  '/buyer/orders': { title: 'orders' },
  '/buyer/shipments': { title: 'shipments' },
  '/buyer/invoices': { title: 'invoices' },
  '/buyer/documents': { title: 'documents' },
  '/buyer/profile': { title: 'companyProfile' },
  '/buyer/addresses': { title: 'shippingAddresses' },
  '/buyer/members': { title: 'teamMembers' },
  '/buyer/kyc': { title: 'kycVerification' },
  '/buyer/notifications': { title: 'notifications' },
}

const SELLER_ROUTE_META: Record<string, { title: string }> = {
  '/seller/dashboard': { title: 'dashboard' },
  '/seller/products': { title: 'products' },
  '/seller/rfq': { title: 'rfqs' },
  '/seller/quotations': { title: 'quotations' },
  '/seller/orders': { title: 'orders' },
  '/seller/shipments': { title: 'shipments' },
  '/seller/invoices': { title: 'invoices' },
  '/seller/documents': { title: 'documents' },
  '/seller/profile': { title: 'companyProfile' },
  '/seller/members': { title: 'teamMembers' },
  '/seller/kyc': { title: 'kycVerification' },
  '/seller/notifications': { title: 'notifications' },
}

interface TopbarProps {
  userId: string
  email: string
  name?: string | null
  role?: string
}

function routeMetaForRole(role?: string): Record<string, { title: string; crumb?: string }> {
  if (role === 'buyer') return BUYER_ROUTE_META
  if (role === 'seller') return SELLER_ROUTE_META
  return ROUTE_META
}

export function Topbar({ userId: _userId, email, name, role }: TopbarProps) {
  const { data: profile } = useQuery(profileOptions())
  const workspace = profile ? workspaceFor(profile) : undefined
  const t = useTranslations('dashboardChrome')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const routeMeta = routeMetaForRole(role)

  const matched = Object.keys(routeMeta)
    .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0]
  const meta = matched ? routeMeta[matched] : undefined
  const capability = Object.entries(productPaths).find(([, path]) => pathname === path)?.[0]
  const [serviceSlug, moduleSlug] = capability?.split('/') ?? []
  const moduleService = serviceNavigation.find((service) => service.slug === serviceSlug)
  const currentModule = moduleService?.modules.find((module) => module.slug === moduleSlug)
  const currentFeature = features.find(
    (feature) => pathname === `/${feature.slug}` || pathname.startsWith(`/${feature.slug}/`),
  )

  return (
    <>
      <header className="glass sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 md:px-6 lg:px-8">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('openMenu')}
          >
            <MenuIcon className="size-4" />
          </Button>

          <div className="font-semibold text-base tracking-[-0.03em]">
            {workspace && (
              <span className="mr-3 hidden text-xs font-normal text-muted-foreground lg:inline">
                {workspace === 'platform'
                  ? 'Backoffice'
                  : workspace === 'reseller'
                    ? 'Reseller'
                    : 'Merchant'}{' '}
                /
              </span>
            )}
            {currentFeature
              ? t(currentFeature.label)
              : currentModule
                ? t(currentModule.label)
                : meta
                  ? t(meta.title)
                  : ''}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <div className="mx-0.5 hidden sm:block">
            <ThemeToggle />
          </div>
          <UserMenu email={email} name={name} />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        email={email}
        name={name}
        role={role}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
    </>
  )
}
