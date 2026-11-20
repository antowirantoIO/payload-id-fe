import { auth } from '@/auth'
import { AccountDashboard } from '@/features/account/client'
import { redirect } from '@/i18n/navigation'
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session || session.error) redirect({ href: '/login', locale })
  return <AccountDashboard />
}
