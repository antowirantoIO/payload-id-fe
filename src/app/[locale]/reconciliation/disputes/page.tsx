import { ModuleRoute } from '@/features/account/server'
export default async function DisputesPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="accounting" module="disputes" />
}
