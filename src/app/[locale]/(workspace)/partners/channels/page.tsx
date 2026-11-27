import { ChannelsPage } from '@/features/channels/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const access = await requireCapability((await params).locale, 'issuer/channels')
  return <ChannelsPage permissions={access.profile.permissions} />
}
