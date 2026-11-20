import { ModuleRoute } from '@/features/account/server'
export default async function RefundsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="payment" module="refunds" />
}
