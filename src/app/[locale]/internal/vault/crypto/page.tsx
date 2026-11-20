import { ModuleRoute } from '@/features/account/server'
export default async function CryptoPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="vault" module="crypto" />
}
