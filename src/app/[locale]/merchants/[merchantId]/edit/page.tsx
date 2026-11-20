import { ModuleRoute } from '@/features/account/server'
import { MerchantEditorPage } from '@/features/merchants/client'

export default async function EditMerchantPage({
  params,
}: {
  params: Promise<{ locale: string; merchantId: string }>
}) {
  const { locale, merchantId } = await params
  return (
    <ModuleRoute locale={locale} service="iam" module="merchants">
      <MerchantEditorPage merchantId={merchantId} />
    </ModuleRoute>
  )
}
