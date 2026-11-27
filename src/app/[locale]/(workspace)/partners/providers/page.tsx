import { ProvidersPage } from '@/features/providers/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const access = await requireCapability((await params).locale, 'issuer/issuers')
  return <ProvidersPage permissions={access.profile.permissions} />
}
