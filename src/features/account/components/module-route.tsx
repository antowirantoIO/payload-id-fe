import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { auth } from '@/auth'
import { featureForModule, visibleFeatureModules } from '@/components/layout/features'
import { findModule } from '@/components/layout/navigation'
import { productPath } from '@/components/layout/product-paths'
import { Link, redirect } from '@/i18n/navigation'
import { getServerProfile } from '@/lib/auth/server-profile'
import { canViewModule } from '@/lib/auth/workspace'
import { ModuleShell } from './module-shell'

export async function ModuleRoute({
  locale,
  service,
  module,
  children,
}: {
  locale: string
  service: string
  module: string
  children?: ReactNode
}) {
  const entry = findModule(service, module)
  if (!entry) notFound()
  const session = await auth()
  if (!session || session.error) redirect({ href: '/login', locale })
  const profile = await getServerProfile()
  if (!profile) redirect({ href: '/login', locale })
  if (!profile || !canViewModule(profile, service, module)) notFound()
  const t = await getTranslations('dashboardChrome')
  const copy = await getTranslations('modules')
  const area = featureForModule(service, module)
  if (children) {
    return (
      <ModuleShell email={session?.user?.email ?? ''} name={session?.user?.name}>
        {children}
      </ModuleShell>
    )
  }
  return (
    <ModuleShell email={session?.user?.email ?? ''} name={session?.user?.name}>
      <p className="text-sm text-muted-foreground">{area ? t(area.label) : entry.group.label}</p>
      <h1 className="mt-2 text-2xl leading-8 font-semibold tracking-tight">
        {t(entry.feature.label)}
      </h1>
      <section className="mt-6 border bg-card p-6">
        <h2 className="font-semibold">{copy(service === 'vault' ? 'internal' : 'pending')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {copy(service === 'vault' ? 'internalDescription' : 'description')}
        </p>
        <h3 className="mt-6 text-sm font-medium">{copy('contracts')}</h3>
        <ul className="mt-3 space-y-2">
          {entry.feature.endpoints.map((endpoint) => (
            <li key={endpoint} className="break-all font-mono text-xs">
              {service === 'vault' ? 'gRPC: ' : ''}
              {endpoint}
            </li>
          ))}
        </ul>
      </section>
      <nav className="mt-6 flex flex-wrap gap-3" aria-label={t(entry.feature.label)}>
        {(area ? visibleFeatureModules(profile, area) : [])
          .filter((path) => path !== `${service}/${module}`)
          .map((path) => {
            const [detailService, detailModule] = path.split('/')
            const detail = findModule(detailService, detailModule)
            if (!detail || !canViewModule(profile, detailService, detailModule)) return null
            return (
              <Link
                key={path}
                href={productPath(path)}
                className="inline-flex min-h-11 items-center rounded-md border bg-card px-4 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                {t(detail.feature.label)}
              </Link>
            )
          })}
      </nav>
    </ModuleShell>
  )
}
