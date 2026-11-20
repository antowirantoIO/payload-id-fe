import { ModuleRoute } from '@/features/account/server'
export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="iam" module="roles" />
}
