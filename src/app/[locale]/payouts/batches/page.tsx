import { ModuleRoute } from '@/features/account/server'
export default async function BatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="payment" module="batches" />
}
