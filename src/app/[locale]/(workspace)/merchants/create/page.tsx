import { MerchantEditorPage } from '@/features/merchants/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireCapability(locale, 'iam/merchants')
  return <MerchantEditorPage />
}
