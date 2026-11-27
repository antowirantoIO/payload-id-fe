import { getTranslations } from 'next-intl/server'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { WorkspaceHeader } from './dashboard/workspace-header'

type IntegrationPendingProps = {
  title: string
  area: string
  endpoints: readonly string[]
  internal: boolean
  related: readonly { href: string; label: string }[]
}

/** Presentation only. The calling server page must authorize its capability first. */
export async function IntegrationPending({
  title,
  area,
  endpoints,
  internal,
  related,
}: IntegrationPendingProps) {
  const t = await getTranslations('dashboardChrome')
  const copy = await getTranslations('modules')
  return (
    <>
      <p className="mb-2 text-sm text-muted-foreground">{t(area)}</p>
      <WorkspaceHeader title={t(title)} />
      <section className="mt-6 border bg-card p-6">
        <h2 className="font-semibold">{copy(internal ? 'internal' : 'pending')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {copy(internal ? 'internalDescription' : 'description')}
        </p>
        <h3 className="mt-6 text-sm font-medium">{copy('contracts')}</h3>
        <ul className="mt-3 space-y-2">
          {endpoints.map((endpoint) => (
            <li key={endpoint} className="break-all font-mono text-xs">
              {internal ? 'gRPC: ' : ''}
              {endpoint}
            </li>
          ))}
        </ul>
      </section>
      {related.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-3" aria-label={t(title)}>
          {related.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={buttonVariants({ variant: 'outline', className: 'min-h-11' })}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
