import { FeatureRoute } from '@/features/account/server'
export default async function PayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <FeatureRoute locale={(await params).locale} slug="payouts" />
}
