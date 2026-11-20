import { ModuleRoute } from '@/features/account/server'
export default async function SealPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="vault" module="seal" />
}
