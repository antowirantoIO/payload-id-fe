import { FeatureRoute } from '@/features/account/server'
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  return <FeatureRoute locale={(await params).locale} slug="pricing" />
}
