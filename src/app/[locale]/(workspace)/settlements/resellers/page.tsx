import { IntegrationPending } from '@/components/shared/integration-pending'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const access = await requireCapability((await params).locale, 'accounting/reseller')
  return <IntegrationPending {...access} />
}
