'use client'

import { useTranslations } from 'next-intl'
import { RecordSection } from '@/components/shared/record-section'
import { SemanticStatus } from '@/components/shared/semantic-status'
import { healthTone, type Provider, statusTone } from '../lib/model'

export function ProviderDetail({
  provider,
  canViewCredentials,
}: {
  provider: Provider
  canViewCredentials: boolean
}) {
  const t = useTranslations('providers')
  const sections = [
    {
      title: 'details',
      fields: [
        ['code', provider.code],
        ['name', provider.name],
        ['baseUrl', provider.base_url],
        ['sandboxUrl', provider.base_url_sandbox],
        ['currencies', provider.supported_currencies.join(', ')],
      ],
    },
    {
      title: 'record',
      fields: [
        ['createdAt', provider.created_at],
        ['updatedAt', provider.updated_at],
        ['checkedAt', provider.health_checked_at],
      ],
    },
  ]
  return (
    <>
      <RecordSection title={t('availability')}>
        <div className="flex flex-wrap gap-2">
          <SemanticStatus
            label={t(
              provider.status === 'ACTIVE'
                ? 'active'
                : provider.status === 'MAINTENANCE'
                  ? 'maintenance'
                  : 'inactive',
            )}
            tone={statusTone(provider.status)}
          />
          <SemanticStatus
            label={t(
              provider.health_status === 'HEALTHY'
                ? 'healthy'
                : provider.health_status === 'DEGRADED'
                  ? 'degraded'
                  : provider.health_status === 'DOWN'
                    ? 'unavailable'
                    : 'untested',
            )}
            tone={healthTone(provider.health_status)}
          />
        </div>
        {provider.local_check && (
          <p className="mt-3 text-sm text-muted-foreground">
            {t(provider.local_check === 'valid' ? 'localValid' : 'localInvalid')}
          </p>
        )}
      </RecordSection>
      {sections.map((section) => (
        <RecordSection key={section.title} title={t(section.title)}>
          <dl className="grid gap-4 sm:grid-cols-2">
            {section.fields.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs text-muted-foreground">{t(String(key))}</dt>
                <dd className="mt-1 wrap-anywhere text-sm">{value || t('notProvided')}</dd>
              </div>
            ))}
          </dl>
        </RecordSection>
      ))}
      <RecordSection title={t('channels')}>
        <ul className="space-y-2 text-sm">
          {provider.channels.length ? (
            provider.channels.map((channel) => (
              <li key={channel.id} className="wrap-anywhere">
                {channel.name}{' '}
                <span className="font-mono text-xs text-muted-foreground">{channel.code}</span>
              </li>
            ))
          ) : (
            <li>{t('notProvided')}</li>
          )}
        </ul>
      </RecordSection>
      {canViewCredentials && (
        <RecordSection title={t('credentialMetadata')}>
          <p className="mb-3 text-xs text-muted-foreground">{t('credentialSafe')}</p>
          <ul className="space-y-2 font-mono text-xs">
            {provider.credential_keys.length ? (
              provider.credential_keys.map((key) => <li key={key}>{key}: ***</li>)
            ) : (
              <li>{t('notProvided')}</li>
            )}
          </ul>
        </RecordSection>
      )}
      <RecordSection title={t('activity')}>
        <ul className="space-y-3 text-sm">
          {provider.history.length ? (
            provider.history.toReversed().map((item) => (
              <li key={`${item.at}-${item.message}`}>
                <p>{t(item.message)}</p>
                <time className="text-xs text-muted-foreground">{item.at}</time>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">{t('emptyActivity')}</li>
          )}
        </ul>
      </RecordSection>
    </>
  )
}
