import { ModuleRoute } from '@/features/account/server'
export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="iam" module="security" />
}
