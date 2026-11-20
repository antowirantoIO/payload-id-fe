import { ModuleRoute } from '@/features/account/server'
export default async function CredentialsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="issuer" module="credentials" />
}
