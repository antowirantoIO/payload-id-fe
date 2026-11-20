import { ModuleRoute } from '@/features/account/server'
export default async function DisbursementsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <ModuleRoute locale={(await params).locale} service="open" module="disbursements" />
}
