import { PayoutsPage } from '@/features/payouts/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const access = await requireCapability(locale, 'payment/payouts')
  return <PayoutsPage profile={access.profile} />
}
