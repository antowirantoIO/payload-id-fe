import { TransactionsPage } from '@/features/transactions/client'
import { requireCapability } from '@/lib/auth/access'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireCapability(locale, 'payment/transactions')
  return <TransactionsPage />
}
