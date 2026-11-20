import { ModuleRoute } from '@/features/account/server'
import { MerchantsPage as MerchantsWorkspace } from '@/features/merchants/client'
export default async function MerchantsPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <ModuleRoute locale={(await params).locale} service="iam" module="merchants">
      <MerchantsWorkspace />
    </ModuleRoute>
  )
}
