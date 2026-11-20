import { ModuleRoute } from '@/features/account/server'
import { MerchantEditorPage } from '@/features/merchants/client'

export default async function CreateMerchantPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return (
    <ModuleRoute locale={(await params).locale} service="iam" module="merchants">
      <MerchantEditorPage />
    </ModuleRoute>
  )
}
