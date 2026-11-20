import { ModuleRoute } from '@/features/account/server'
export default async function FeesPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="fees" />
}
