import { backofficeMessages } from '@/messages/backoffice'
import { channelMessages } from '@/messages/channels'
import { featureMessages } from '@/messages/features'
import { merchantMessages } from '@/messages/merchants'
import { moduleMessages, navigationMessages } from '@/messages/navigation'
import { operationalDashboardMessages } from '@/messages/operational-dashboard'
import { payoutMessages } from '@/messages/payouts'
import { providerMessages } from '@/messages/providers'
import { routingMessages } from '@/messages/routing'
import { tableMessages } from '@/messages/table'
import { transactionMessages } from '@/messages/transactions'
import en from './en.json'
import id from './id.json'

export const supportedLocales = ['en', 'id'] as const
export type SupportedLocale = (typeof supportedLocales)[number]
const baseMessages = { en, id }

export function composeMessages(locale: SupportedLocale) {
  const messages = baseMessages[locale]
  return {
    ...messages,
    dashboardChrome: {
      ...messages.dashboardChrome,
      ...navigationMessages[locale],
      ...backofficeMessages[locale],
      ...featureMessages[locale],
      administrationGroup: locale === 'id' ? 'Pengaturan' : 'Settings',
      featureNavigation: locale === 'id' ? 'Navigasi utama' : 'Main navigation',
    },
    merchants: merchantMessages[locale],
    modules: moduleMessages[locale],
    table: tableMessages[locale],
    transactions: transactionMessages[locale],
    operationalDashboard: operationalDashboardMessages[locale],
    payouts: payoutMessages[locale],
    providers: providerMessages[locale],
    channels: channelMessages[locale],
    routing: routingMessages[locale],
  }
}
