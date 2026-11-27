import 'server-only'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import {
  canViewFeature,
  contractsForFeature,
  featureForModule,
  features,
  visibleFeatureModules,
} from '@/lib/workspace/features'
import { findModule } from '@/lib/workspace/navigation'
import { type Capability, productPath } from '@/lib/workspace/product-paths'
import { getServerProfile } from './server-profile'
import { getServerSession } from './server-session'
import { canViewModule } from './workspace'

export async function requireSession(locale: string) {
  const session = await getServerSession()
  if (!session || session.error) return redirect({ href: '/login', locale })
  return session
}

export async function requireProfile(locale: string) {
  await requireSession(locale)
  const profile = await getServerProfile()
  if (!profile) return redirect({ href: '/login', locale })
  return profile
}

export async function requireCapability(locale: string, capability: Capability) {
  const [service, module] = capability.split('/')
  const entry = findModule(service, module)
  if (!entry) notFound()
  const profile = await requireProfile(locale)
  if (!canViewModule(profile, service, module)) notFound()
  const area = featureForModule(service, module)
  const related = (area ? visibleFeatureModules(profile, area) : []).flatMap((path) => {
    if (path === capability) return []
    const [relatedService, relatedModule] = path.split('/')
    const detail = findModule(relatedService, relatedModule)
    return detail ? [{ href: productPath(path), label: detail.feature.label }] : []
  })
  return {
    profile,
    title: entry.feature.label,
    area: area?.label ?? entry.group.label,
    endpoints: entry.feature.endpoints,
    internal: service === 'vault',
    related,
  }
}

/** Product landing policy is separate from direct capability authorization. */
export async function resolveFeatureLanding(locale: string, slug: string) {
  const feature = features.find((item) => item.slug === slug)
  if (!feature) notFound()
  const profile = await requireProfile(locale)
  if (!canViewFeature(profile, feature)) notFound()
  const first = contractsForFeature(profile, feature)[0]
  if (first) return redirect({ locale, href: productPath(first.path) })
  return feature
}
