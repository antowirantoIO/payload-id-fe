'use client'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { z } from 'zod'
import { canViewFeature, features } from '@/components/layout/features'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { apiGet } from '@/lib/api/client'
import { type WorkspaceProfile, workspaceFor } from '@/lib/auth/workspace'
import { alertsSchema, summarySchema } from '../schemas/dashboard-contracts'

const resultSchema = z.discriminatedUnion('workspace', [
  z.object({ workspace: z.literal('platform'), data: alertsSchema }),
  z.object({ workspace: z.enum(['merchant', 'reseller']), data: summarySchema }),
])
export function OperationalOverview({ profile }: { profile: WorkspaceProfile }) {
  const t = useTranslations('operationalDashboard')
  const labels = useTranslations('dashboardChrome')
  const locale = useLocale()
  const workspace = workspaceFor(profile)
  const permitted =
    Boolean(workspace) &&
    profile.permissions.includes(workspace === 'merchant' ? 'transaction.read' : 'report.read')
  const query = useQuery({
    queryKey: ['dashboard', workspace, profile.id],
    enabled: permitted,
    queryFn: async ({ signal }) => resultSchema.parse(await apiGet('/api/dashboard', signal)),
  })
  const summary = query.data && query.data.workspace !== 'platform' ? query.data.data : undefined
  const links = features.filter(
    (feature) =>
      [
        'payments',
        'payouts',
        'approvals',
        'settlements',
        'reconciliation',
        'merchants',
        'balances',
      ].includes(feature.slug) && canViewFeature(profile, feature),
  )
  return (
    <section className="mt-6 space-y-6" aria-label={t('overview')}>
      <div>
        <h2 className="text-xl font-semibold">{t(workspace ?? 'unknown')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('scope')}</p>
      </div>
      {!permitted ? (
        <p>{t('restricted')}</p>
      ) : query.isPending ? (
        <p role="status">{t('loading')}</p>
      ) : query.isError ? (
        <div className="border bg-card p-5">
          <p role="alert">{t('error')}</p>
          <Button variant="outline" className="mt-3" onClick={() => query.refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : query.data?.workspace === 'platform' ? (
        <div className="border bg-card p-5">
          <h3 className="font-semibold">{t('alerts')}</h3>
          {query.data.data.alerts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('noAlerts')}</p>
          ) : (
            <ul className="mt-3 divide-y">
              {query.data.data.alerts.map((alert) => (
                <li key={`${alert.title}-${alert.created_at}-${alert.message}`} className="py-3">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : summary ? (
        <dl className="grid grid-cols-1 divide-y border bg-card sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
          {(
            [
              'today_transactions',
              'today_payin_volume',
              'today_payout_volume',
              'month_transactions',
            ] as const
          ).map((key) => (
            <div key={key} className="min-w-0 p-5">
              <dt className="text-sm text-muted-foreground">{t(key)}</dt>
              <dd className="mt-3 break-words text-2xl font-semibold">
                {new Intl.NumberFormat(
                  locale,
                  key.includes('volume')
                    ? { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }
                    : {},
                ).format(summary[key])}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div>
        <h3 className="font-semibold">{t('shortcuts')}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="inline-flex min-h-11 items-center rounded-md border bg-card px-4 text-sm hover:bg-accent"
            >
              {labels(label)}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t('pending')}</p>
      </div>
    </section>
  )
}
