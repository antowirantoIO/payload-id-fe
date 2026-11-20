import { ModuleRoute } from '@/features/account/server'
import { TransactionsPage } from '@/features/transactions/client'
export default async function PaymentTransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return (
    <ModuleRoute locale={(await params).locale} service="payment" module="transactions">
      <TransactionsPage />
    </ModuleRoute>
  )
}
