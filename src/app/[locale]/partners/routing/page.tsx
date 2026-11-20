import { ModuleRoute } from '@/features/account/server'
export default async function RoutingPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="routing" />
}
