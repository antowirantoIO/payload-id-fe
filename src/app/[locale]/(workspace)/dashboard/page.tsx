import { AccountDashboard } from '@/features/account/client'
import { requireSession } from '@/lib/auth/access'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  await requireSession((await params).locale)
  return <AccountDashboard />
}
