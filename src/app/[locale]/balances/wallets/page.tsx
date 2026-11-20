import { ModuleRoute } from '@/features/account/server'
export default async function WalletsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="accounting" module="wallets" />
}
