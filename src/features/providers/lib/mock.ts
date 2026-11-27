import { type Provider, providerListSchema, providerSchema } from '../contracts'

const names = ['Nusantara Pay', 'Cloud Money', 'Komet Bank', 'Raya Connect', 'Atlas Switch']
const banks = ['BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'QRIS']
export const mockProviders: Provider[] = providerListSchema.parse(
  Array.from({ length: 5 }, (_, index) => {
    const number = index + 1
    const checked = new Date(Date.UTC(2026, 10, 21, 8 - index, 20)).toISOString()
    return providerSchema.parse({
      id: `provider-${number}`,
      code: `ISSUER_${String(number).padStart(2, '0')}`,
      name: names[index],
      description: `${names[index]} payment processing integration.`,
      base_url: `https://api.provider-${number}.example.com/v1`,
      base_url_sandbox: index === 3 ? null : `https://sandbox.provider-${number}.example.com/v1`,
      status: index === 3 ? 'MAINTENANCE' : index === 4 ? 'INACTIVE' : 'ACTIVE',
      health_status: index === 2 ? 'DEGRADED' : index === 3 ? 'DOWN' : 'HEALTHY',
      health_checked_at: index === 4 ? null : checked,
      supported_currencies: index === 1 ? ['IDR', 'USD', 'SGD'] : ['IDR'],
      metadata: { region: index % 2 ? 'SEA' : 'Indonesia', integration: 'API' },
      channel_count: index + 1,
      channels: banks.slice(0, (index % 3) + 1).map((code, channelIndex) => ({
        id: `channel-${number}-${channelIndex}`,
        code,
        name: code.replaceAll('_', ' '),
        category: code === 'QRIS' ? 'QRIS' : 'BANK_TRANSFER',
      })),
      credential_keys: index === 4 ? [] : ['client_id', 'client_secret'],
      created_at: new Date(Date.UTC(2026, 9, 10 - index, 8)).toISOString(),
      updated_at: checked,
    })
  }),
)
export async function loadMockProviders(signal: AbortSignal, delay = 220) {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay)
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) return abort()
    signal.addEventListener('abort', abort, { once: true })
  })
  return mockProviders.map((provider) => ({
    ...provider,
    channels: provider.channels.map((channel) => ({ ...channel })),
    credential_keys: [...provider.credential_keys],
  }))
}
