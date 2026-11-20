import { FeatureRoute } from '@/features/account/server'
export default async function PaymentLinksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <FeatureRoute locale={(await params).locale} slug="payment-links" />
}
