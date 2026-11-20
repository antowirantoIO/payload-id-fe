import { ModuleRoute } from '@/features/account/server'
export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <ModuleRoute locale={(await params).locale} service="iam" module="notifications" />
}
