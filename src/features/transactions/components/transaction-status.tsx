import type { useTranslations } from 'next-intl'
import { SemanticStatus, type StatusTone } from '@/components/shared/semantic-status'

export type TransactionCopy = ReturnType<typeof useTranslations<'transactions'>>

export function TransactionStatus({ value, t }: { value: string; t: TransactionCopy }) {
  const tone: StatusTone = ['PAID', 'SUCCESS', 'SETTLED'].includes(value)
    ? 'success'
    : ['FAILED', 'REFUND_FAILED'].includes(value)
      ? 'danger'
      : ['PENDING', 'PROCESSING', 'PENDING_APPROVAL', 'REFUND_PENDING'].includes(value)
        ? 'warning'
        : 'neutral'
  return <SemanticStatus label={t(value)} tone={tone} />
}
