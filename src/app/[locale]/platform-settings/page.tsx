import { FeatureRoute } from '@/features/account/server'
export default async function PlatformSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <FeatureRoute locale={(await params).locale} slug="platform-settings" />
}
