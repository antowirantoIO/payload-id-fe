import { ModuleRoute } from '@/features/account/server'
export default async function IssuersPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="issuers" />
}
