'use client'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { WorkspaceHeader } from '@/components/shared/dashboard/workspace-header'
import { RecordSection } from '@/components/shared/record-section'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth/client'
import { profileOptions } from '../queries/profile'
import { OperationalOverview } from './operational-overview'
export function AccountDashboard() {
  const t = useTranslations('app')
  const profile = useQuery(profileOptions())
  const { logout, isPending: loggingOut } = useLogout()
  return (
    <>
      <WorkspaceHeader title={t('overview')} description={t('overviewDescription')} />
      {profile.data && <OperationalOverview profile={profile.data} />}
      <RecordSection title={t('profile')} className="mt-8">
        {profile.isPending ? (
          <p role="status" className="mt-4">
            {t('loading')}
          </p>
        ) : profile.isError ? (
          <div className="mt-4 space-y-4">
            <p role="alert">{t('profileError')}</p>
            <Button
              variant="outline"
              className="min-h-11 shadow-none"
              onClick={() => profile.refetch()}
            >
              {t('retry')}
            </Button>
            <Button
              variant="outline"
              className="min-h-11 ml-3 shadow-none"
              disabled={loggingOut}
              onClick={logout}
            >
              {t('signInAgain')}
            </Button>
          </div>
        ) : !profile.data ? (
          <p>{t('empty')}</p>
        ) : (
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {[
              ['name', profile.data.name],
              ['email', profile.data.email],
              ['tenant', profile.data.tenant_id],
              ['merchant', profile.data.merchant_id ?? t('notAssigned')],
            ].map(([key, value]) => (
              <div key={key} className="min-w-0 border-b py-4">
                <dt className="text-sm text-muted-foreground">{t(key)}</dt>
                <dd className="mt-1 break-all font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </RecordSection>
      <p className="mt-6 text-sm text-muted-foreground">{t('foundationNote')}</p>
    </>
  )
}
