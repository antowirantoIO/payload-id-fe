import { FeatureRoute } from '@/features/account/server'
export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <FeatureRoute locale={(await params).locale} slug="approvals" />
}
