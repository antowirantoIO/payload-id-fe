import { ModuleRoute } from '@/features/account/server'
export default async function MonitoringPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="monitoring" />
}
