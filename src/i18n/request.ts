import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { backofficeMessages } from '@/messages/backoffice'
import { featureMessages } from '@/messages/features'
import { moduleMessages, navigationMessages } from '@/messages/navigation'
import { operationalDashboardMessages } from '@/messages/operational-dashboard'
import { transactionMessages } from '@/messages/transactions'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const messages = (await import(`../messages/${locale}.json`)).default
  return {
    locale,
    messages: {
      ...messages,
      dashboardChrome: {
        ...messages.dashboardChrome,
        ...navigationMessages[locale],
        ...backofficeMessages[locale],
        ...featureMessages[locale],
        administrationGroup:
          locale === 'id' ? 'Pengaturan' : locale === 'pt-BR' ? 'Configurações' : 'Settings',
        featureNavigation:
          locale === 'id'
            ? 'Navigasi utama'
            : locale === 'pt-BR'
              ? 'Navegação principal'
              : 'Main navigation',
      },
      modules: moduleMessages[locale],
      transactions: transactionMessages[locale],
      operationalDashboard: operationalDashboardMessages[locale],
    },
  }
})
