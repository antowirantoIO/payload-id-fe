import { MerchantDetailPage } from '@/features/merchants/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; merchantId: string }>
}) {
  const { locale, merchantId } = await params
  await requireCapability(locale, 'iam/merchants')
  return <MerchantDetailPage merchantId={merchantId} />
}
