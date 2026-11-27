import { getTranslations } from 'next-intl/server'
import { WorkspaceHeader } from './dashboard/workspace-header'

/** Empty product landing, used only when no capability redirect is available. */
export async function FeaturePending({
  label,
  businessProfile = false,
}: {
  label: string
  businessProfile?: boolean
}) {
  const t = await getTranslations('dashboardChrome')
  return (
    <>
      <WorkspaceHeader title={t(label)} />
      <section className="mt-6 rounded-md border bg-card p-6">
        <h2 className="font-semibold">{t('featurePending')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('featurePendingDescription')}</p>
        {businessProfile && <p className="mt-4 text-sm">{t('featureProfileDescription')}</p>}
      </section>
    </>
  )
}
