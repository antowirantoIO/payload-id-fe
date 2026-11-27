import { FeaturePending } from '@/components/shared/feature-pending'
import { resolveFeatureLanding } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const feature = await resolveFeatureLanding((await params).locale, 'audit')
  return (
    <FeaturePending label={feature.label} businessProfile={feature.slug === 'business-profile'} />
  )
}
