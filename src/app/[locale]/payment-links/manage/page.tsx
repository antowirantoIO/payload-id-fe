import { ModuleRoute } from '@/features/account/server'
export default async function LinksPage({ params }: { params: Promise<{ locale: string }> }) {
  return <ModuleRoute locale={(await params).locale} service="payment" module="links" />
}
