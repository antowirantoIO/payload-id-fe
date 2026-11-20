'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { profileOptions } from '../queries/profile'
import { OperationalOverview } from './operational-overview'
export function AccountDashboard() {
  const t = useTranslations('app')
  const profile = useQuery(profileOptions())
  const client = useQueryClient()
  async function logout() {
    client.clear()
    await signOut({ redirect: false })
    window.location.reload()
  }
  return (
    <div className="flex min-h-svh bg-[#f7f9f8] dark:bg-background">
      {/* biome-ignore lint/a11y/useValidAriaRole: role is a template component's navigation variant, not a DOM ARIA role. */}
      <Sidebar email={profile.data?.email ?? ''} name={profile.data?.name} role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* biome-ignore lint/a11y/useValidAriaRole: role selects template navigation, not a DOM role. */}
        <Topbar
          userId={profile.data?.id ?? ''}
          email={profile.data?.email ?? ''}
          name={profile.data?.name}
          role="admin"
        />
        <main id="main" className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-5 md:px-6 md:pt-4 md:pb-6 lg:px-8 lg:pt-5 lg:pb-7">
            <h1 className="text-2xl leading-8 font-semibold tracking-tight">{t('overview')}</h1>
            <p className="mt-2 text-muted-foreground">{t('overviewDescription')}</p>
            {profile.data && <OperationalOverview profile={profile.data} />}
            <section aria-label={t('profile')} className="mt-10 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">{t('profile')}</h2>
              {profile.isPending ? (
                <p role="status" className="mt-4">
                  {t('loading')}
                </p>
              ) : profile.isError ? (
                <div className="mt-4 space-y-4">
                  <p role="alert">{t('profileError')}</p>
                  <Button variant="outline" className="min-h-11" onClick={() => profile.refetch()}>
                    {t('retry')}
                  </Button>
                  <Button variant="outline" className="min-h-11 ml-3" onClick={logout}>
                    {t('signInAgain')}
                  </Button>
                </div>
              ) : !profile.data ? (
                <p>{t('empty')}</p>
              ) : (
                <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                  {[
                    ['name', profile.data.name],
                    ['email', profile.data.email],
                    ['tenant', profile.data.tenant_id],
                    ['merchant', profile.data.merchant_id ?? t('notAssigned')],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-muted-foreground">{t(key)}</dt>
                      <dd className="mt-1 break-all font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
            <p className="mt-6 text-sm text-muted-foreground">{t('foundationNote')}</p>
          </div>
        </main>
      </div>
    </div>
  )
}
