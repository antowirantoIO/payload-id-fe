import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { canViewFeature, contractsForFeature, features } from '@/components/layout/features'
import { productPath } from '@/components/layout/product-paths'
import { redirect } from '@/i18n/navigation'
import { getServerProfile } from '@/lib/auth/server-profile'
import { ModuleShell } from './module-shell'

export async function FeatureRoute({ locale, slug }: { locale: string; slug: string }) {
  const feature = features.find((feature) => feature.slug === slug)
  if (!feature) notFound()
  const session = await auth()
  if (!session || session.error) redirect({ href: '/login', locale })
  const profile = await getServerProfile()
  if (!profile) redirect({ href: '/login', locale })
  if (!profile || !canViewFeature(profile, feature)) notFound()
  const firstCapability = contractsForFeature(profile, feature)[0]
  if (firstCapability) redirect({ locale, href: productPath(firstCapability.path) })
  const t = await getTranslations('dashboardChrome')
  return (
    <ModuleShell email={session?.user?.email ?? ''} name={session?.user?.name}>
      <h1 className="text-2xl leading-8 font-semibold tracking-tight">{t(feature.label)}</h1>
      <section className="mt-6 rounded-lg border bg-card p-6">
        <h2 className="font-semibold">{t('featurePending')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('featurePendingDescription')}</p>
        {slug === 'business-profile' && (
          <p className="mt-4 text-sm">{t('featureProfileDescription')}</p>
        )}
      </section>
    </ModuleShell>
  )
}
