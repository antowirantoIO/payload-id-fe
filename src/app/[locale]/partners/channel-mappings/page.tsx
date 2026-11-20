import { ModuleRoute } from '@/features/account/server'
export default async function MappingsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="mappings" />
}
