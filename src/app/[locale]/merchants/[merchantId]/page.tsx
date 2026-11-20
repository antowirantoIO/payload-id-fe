import { ModuleRoute } from '@/features/account/server'
import { MerchantDetailPage } from '@/features/merchants/client'

export default async function MerchantPage({
  params,
}: {
  params: Promise<{ locale: string; merchantId: string }>
}) {
  const { locale, merchantId } = await params
  return (
    <ModuleRoute locale={locale} service="iam" module="merchants">
      <MerchantDetailPage merchantId={merchantId} />
    </ModuleRoute>
  )
}
