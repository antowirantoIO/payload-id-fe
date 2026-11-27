import {
  type Channel,
  channelCategories,
  channelDirections,
  channelListSchema,
  channelStatuses,
} from '../contracts'

const names = ['Bank transfer', 'Virtual account', 'QRIS', 'Card payments', 'Wallet payments']
export const mockChannels: Channel[] = channelListSchema.parse(
  Array.from({ length: 12 }, (_, index) => {
    const created = new Date(Date.UTC(2026, 9, 10 - index, 8)).toISOString()
    return {
      id: `channel-${index + 1}`,
      code: `CHANNEL_${String(index + 1).padStart(2, '0')}`,
      name: names[index % names.length],
      category: channelCategories[index % channelCategories.length],
      direction: channelDirections[index % channelDirections.length],
      currency: index % 3 ? 'IDR' : 'USD',
      icon_url: null,
      status: channelStatuses[index % channelStatuses.length],
      created_at: created,
      updated_at: new Date(Date.parse(created) + index * 86400000).toISOString(),
      provider_code: index % 4 === 0 ? 'ISSUER_01' : 'ISSUER_02',
      provider_name: index % 4 === 0 ? 'Nusantara Pay' : 'Cloud Money',
    }
  }),
)
export async function loadMockChannels(signal: AbortSignal, delay = 180) {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay)
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) return abort()
    signal.addEventListener('abort', abort, { once: true })
  })
  return mockChannels.map((channel) => ({ ...channel }))
}
